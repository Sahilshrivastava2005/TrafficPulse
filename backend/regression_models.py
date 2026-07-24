import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, KFold, RandomizedSearchCV
from sklearn.metrics import mean_squared_error, r2_score
import lightgbm as lgb
import xgboost as xgb
import pickle
from sklearn.ensemble import RandomForestRegressor, AdaBoostRegressor


def out_of_fold_target_encoding(df, cat_col, target_col, n_splits=5, random_state=42):
    encoded = np.full(len(df), np.nan)
    global_mean = df[target_col].mean()
    kf = KFold(n_splits=n_splits, shuffle=True, random_state=random_state)
    for tr_idx, val_idx in kf.split(df):
        cat_means = df.iloc[tr_idx].groupby(cat_col)[target_col].mean()
        encoded[val_idx] = df.iloc[val_idx][cat_col].map(cat_means).fillna(global_mean)
    full_mapping = df.groupby(cat_col)[target_col].mean().to_dict()
    full_mapping['__global_mean__'] = global_mean
    return pd.Series(encoded, index=df.index).fillna(global_mean), full_mapping

def prepare_features(df, is_train=True, road_name_mapping=None):
    d = df.copy()

    if is_train:
        d['road_name_enc'], road_mapping = out_of_fold_target_encoding(d, 'road_name', 'congestion_surge_index')
    else:
        gm = road_name_mapping.get('__global_mean__', 40.0)
        d['road_name_enc'] = d['road_name'].map(road_name_mapping).fillna(gm)
        road_mapping = road_name_mapping

    if is_train:
        d['station_enc'], station_mapping = out_of_fold_target_encoding(d, 'police_station', 'congestion_surge_index')
    else:
        gm2 = road_name_mapping.get('__station_global_mean__', 40.0)
        sm  = road_name_mapping.get('__station_mapping__', {})
        d['station_enc'] = d['police_station'].map(sm).fillna(gm2)
        station_mapping = sm

    base_features = [
        'hour', 'day_of_week', 'month', 'is_rush_hour', 'weekend_flag',
        'hour_sin', 'hour_cos', 'dow_sin', 'dow_cos',
        'distance_to_metro', 'distance_to_market',
        'distance_to_intersection', 'distance_to_hub',
        'is_near_intersection', 'spillover_multiplier',
        'historical_risk_score', 'event_recurrence_frequency',
        'time_to_resolution_minutes', 'mean_resolution_by_cause',
        'resolution_delay_ratio', 'planned_event_lead_time_hours',
        'multi_incident_overlap_score', 'temporal_density_score',
        'corridor_vulnerability_tier',
        'cause_severity_score', 'priority_weight', 'cause_priority_interaction',
        'estimated_impact_scale',
        'road_name_enc', 'station_enc',
    ]

    cat_onehot = ['event_cause', 'event_type', 'priority', 'status', 'corridor']
    feature_cols = list(base_features)
    for col in cat_onehot:
        if col in d.columns:
            dummies = pd.get_dummies(d[col], prefix=col, dtype=float)
            d = pd.concat([d, dummies], axis=1)
            feature_cols.extend(dummies.columns.tolist())

    if is_train:
        road_mapping['__station_global_mean__'] = d['station_enc'].mean()
        road_mapping['__station_mapping__'] = station_mapping

    return d, feature_cols, road_mapping


def train_ensemble_models(df):
    d, feature_cols, road_mapping = prepare_features(df, is_train=True)
    X = d[feature_cols]
    y = d['congestion_surge_index']

    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

    # 1. Hyperparameter Tuning for LightGBM
    lgb_param_dist = {
        'n_estimators': [300, 500, 800],
        'learning_rate': [0.03, 0.05, 0.1],
        'max_depth': [7, 9, 11],
        'num_leaves': [63, 127, 255],
        'subsample': [0.8, 0.9, 1.0],
        'colsample_bytree': [0.8, 0.9, 1.0],
        'min_child_samples': [10, 20, 30]
    }
    lgb_base = lgb.LGBMRegressor(random_state=42, verbosity=-1)
    lgb_search = RandomizedSearchCV(
        lgb_base, param_distributions=lgb_param_dist,
        n_iter=6, cv=3, scoring='r2', n_jobs=1, random_state=42
    )
    print("    [Tuning LightGBM...]")
    lgb_search.fit(X_train, y_train)
    lgb_reg = lgb_search.best_estimator_

    # 2. Hyperparameter Tuning for XGBoost
    xgb_param_dist = {
        'n_estimators': [300, 500, 800],
        'learning_rate': [0.03, 0.05, 0.1],
        'max_depth': [5, 7, 9],
        'subsample': [0.8, 0.9, 1.0],
        'colsample_bytree': [0.8, 0.9, 1.0]
    }
    xgb_base = xgb.XGBRegressor(random_state=42, objective='reg:squarederror')
    xgb_search = RandomizedSearchCV(
        xgb_base, param_distributions=xgb_param_dist,
        n_iter=6, cv=3, scoring='r2', n_jobs=1, random_state=42
    )
    print("    [Tuning XGBoost...]")
    xgb_search.fit(X_train, y_train)
    xgb_reg = xgb_search.best_estimator_

    # 3. Train Random Forest
    rf_reg = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=1)
    rf_reg.fit(X_train, y_train)

    # 4. Train AdaBoost
    ada_reg = AdaBoostRegressor(n_estimators=100, learning_rate=0.05, random_state=42)
    ada_reg.fit(X_train, y_train)

    yp_lgb = lgb_reg.predict(X_val)
    yp_xgb = xgb_reg.predict(X_val)
    yp_rf = rf_reg.predict(X_val)
    yp_ada = ada_reg.predict(X_val)
    
    # 4-Model Ensemble: 40% LightGBM, 40% XGBoost, 10% RF, 10% AdaBoost
    yp_ens = 0.4 * yp_lgb + 0.4 * yp_xgb + 0.1 * yp_rf + 0.1 * yp_ada

    metrics = {
        'lgb':      {'rmse': float(np.sqrt(mean_squared_error(y_val, yp_lgb))),
                     'r2':   float(r2_score(y_val, yp_lgb))},
        'xgb':      {'rmse': float(np.sqrt(mean_squared_error(y_val, yp_xgb))),
                     'r2':   float(r2_score(y_val, yp_xgb))},
        'rf':       {'rmse': float(np.sqrt(mean_squared_error(y_val, yp_rf))),
                     'r2':   float(r2_score(y_val, yp_rf))},
        'ada':      {'rmse': float(np.sqrt(mean_squared_error(y_val, yp_ada))),
                     'r2':   float(r2_score(y_val, yp_ada))},
        'ensemble': {'rmse': float(np.sqrt(mean_squared_error(y_val, yp_ens))),
                     'r2':   float(r2_score(y_val, yp_ens))},
    }

    print("=== Model Validation Metrics ===")
    for name, m in metrics.items():
        print(f"  {name:<10} RMSE: {m['rmse']:.4f}   R2: {m['r2']:.4f}")

    best_model_name = min([k for k in metrics.keys() if k != 'ensemble'], key=lambda k: metrics[k]['rmse'])
    print(f"  Best individual model: {best_model_name} (RMSE: {metrics[best_model_name]['rmse']:.4f})")

    payload = {
        'lgb_model':           lgb_reg,
        'xgb_model':           xgb_reg,
        'rf_model':            rf_reg,
        'ada_model':           ada_reg,
        'feature_cols':        feature_cols,
        'road_mapping':        road_mapping,
        'metrics':             metrics,
    }
    import os
    out_path = os.path.join(os.path.dirname(__file__), "..", "data", "model_payload.pkl")
    with open(out_path, 'wb') as f:
        pickle.dump(payload, f)

    return payload, metrics

def predict_surge(df_input, model_payload):
    d, _, _ = prepare_features(df_input, is_train=False, road_name_mapping=model_payload['road_mapping'])
    feature_cols = model_payload['feature_cols']
    for col in feature_cols:
        if col not in d.columns:
            d[col] = 0.0
    X = d[feature_cols]

    p_lgb = model_payload['lgb_model'].predict(X)
    p_xgb = model_payload['xgb_model'].predict(X)
    
    if 'rf_model' in model_payload and 'ada_model' in model_payload:
        p_rf = model_payload['rf_model'].predict(X)
        p_ada = model_payload['ada_model'].predict(X)
        p_ens = 0.4 * p_lgb + 0.4 * p_xgb + 0.1 * p_rf + 0.1 * p_ada
        return p_ens, p_lgb, p_xgb, p_rf
    else:
        p_ens = 0.6 * p_lgb + 0.4 * p_xgb
        return p_ens, p_lgb, p_xgb, np.zeros(len(X))

predict_delay = predict_surge

try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers

    class ResidualBlock(layers.Layer):
        def __init__(self, dim, dropout=0.15, **kwargs):
            super().__init__(**kwargs)
            self.fc1 = layers.Dense(dim)
            self.bn1 = layers.BatchNormalization()
            self.relu = layers.Activation('relu')
            self.dropout = layers.Dropout(dropout)
            self.fc2 = layers.Dense(dim)
            self.bn2 = layers.BatchNormalization()

        def call(self, inputs, training=False):
            residual = inputs
            x = self.fc1(inputs)
            x = self.bn1(x, training=training)
            x = self.relu(x)
            x = self.dropout(x, training=training)
            x = self.fc2(x)
            x = self.bn2(x, training=training)
            return self.relu(x + residual)

    class ResidualMLP(keras.Model):
        def __init__(self, input_dim, hidden_dim=128, n_blocks=3, dropout=0.15, **kwargs):
            super().__init__(**kwargs)
            self.input_layer = layers.Dense(hidden_dim, activation='relu')
            self.blocks = [ResidualBlock(hidden_dim, dropout) for _ in range(n_blocks)]
            self.output_layer = layers.Dense(1)

        def call(self, inputs, training=False):
            x = self.input_layer(inputs)
            for block in self.blocks:
                x = block(x, training=training)
            return self.output_layer(x)

except ImportError:
    class ResidualMLP:
        def __init__(self, *args, **kwargs):
            pass


