# Migracje — zasady

- Nigdy nie edytuj istniejącej migracji po wdrożeniu
- Nowa zmiana = nowa migracja
- Zawsze definiuj foreign keys z onDelete
- Indeksy na kolumnach używanych w WHERE/JOIN
- Nazewnictwo: xxxx_create_[table]_table.php lub xxxx_add_[column]_to_[table]_table.php
