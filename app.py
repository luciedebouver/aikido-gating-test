import yaml
import django
print(django.get_version(), yaml.load("a: 1", Loader=yaml.Loader))
