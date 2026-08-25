from django.db import migrations


def reassign_legacy_roles(apps, schema_editor):
    """L'administrateur fait maintenant aussi office de rédacteur en chef —
    les anciens rôles super_admin et redacteur_chef n'existent plus, tout
    utilisateur qui les avait devient admin."""
    User = apps.get_model("accounts", "User")
    User.objects.filter(role__in=["super_admin", "redacteur_chef"]).update(role="admin")


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(reassign_legacy_roles, noop_reverse),
    ]
