import os

def generate_tree(root_path, prefix=""):
    entries = [e for e in os.listdir(root_path) if not e.startswith('.')]
    entries.sort()
    for idx, entry in enumerate(entries):
        path = os.path.join(root_path, entry)
        connector = "└── " if idx == len(entries) - 1 else "├── "
        yield f"{prefix}{connector}{entry}"
        if os.path.isdir(path):
            extension = "    " if idx == len(entries) - 1 else "│   "
            yield from generate_tree(path, prefix + extension)

def main():
    workspace_root = os.path.abspath(os.path.dirname(__file__))
    output_file = os.path.join(workspace_root, "file-structure.txt")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(f"{os.path.basename(workspace_root)}/\n")
        for line in generate_tree(workspace_root):
            f.write(line + "\n")
    print(f"File structure has been written to {output_file}")

if __name__ == "__main__":
    main()
