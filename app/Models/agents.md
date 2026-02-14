# Modele Eloquent — zasady

- Relacje: belongsTo, hasMany, belongsToMany — zdefiniowane w modelu
- $fillable jawnie — nigdy $guarded = []
- $casts dla JSON, datetime, enum
- Scopes dla częstych filtrów (scopeForUser, scopePublic)
- Nie umieszczaj logiki biznesowej — to rola Service
