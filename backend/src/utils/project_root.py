from pathlib import Path

script_dir = Path(__file__).resolve().parent

project_root = script_dir
while not (project_root / "src").exists():
    project_root = project_root.parent
    if project_root == project_root.parent:
        raise FileNotFoundError("Could not find project root (containing 'src/')")
