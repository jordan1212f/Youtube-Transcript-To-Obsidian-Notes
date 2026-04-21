import json
from pathlib import Path

CONFIG_DIR = Path.home() / 'yt.note'
CONFIG_PATH = CONFIG_DIR / 'config.json'


"""
Checks if the config file exists.
"""
def config_exists():
    return CONFIG_PATH.exists()

"""
Reads the config file and returns it as a dict
"""
def load_config():
    text = CONFIG_PATH.read_text()
    return json.loads(text)

"""
Write config dict to config file as a pretty JSON
Creates a YT note folder if not already 
Handles for any missing parents folder and wont crash if that folder already exists
"""
def save_config(config):
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    CONFIG_PATH.write_text(json.dumps(config, indent=2))

"""
Asks for both path + API key on first run + saved once
Answers are saved to a config file, loaded automatically each run
"""
def prompt_for_config():
    print('\n First time setup\n')

    vault_path = input('Enter your Obsidan Vault Path: ').strip()
    api_key = input('Enter your Claude API key: ').strip()

    if not vault_path:
        raise ValueError('Vault path cannot be empty')
    if not api_key:
        raise ValueError('API key cannot be empty')
    
    if not Path(vault_path).exists():
        raise ValueError(f'Vault path does not exist: {vault_path}')
    
    config = {
        'vault_path': vault_path,
        'api_key': api_key
    }

    save_config(config)
    print(f'Config saved successfully! to {CONFIG_PATH}')

    return config