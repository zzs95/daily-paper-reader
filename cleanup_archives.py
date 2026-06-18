import subprocess

# Generate list of dates from 20260520 to 20260616
dates = []
start = 20260520
end = 20260616

for i in range(start, end + 1):
    date_str = str(i)
    # Validate it's a real date
    year = int(date_str[:4])
    month = int(date_str[4:6])
    day = int(date_str[6:8])
    
    if 1 <= month <= 12 and 1 <= day <= 31:
        dates.append(date_str)

# Generate git rm commands
commands = []
for date in dates:
    folder_path = f"archive/{date}/recommend"
    commands.append(f"git rm -rf '{folder_path}'")

# Execute all commands
for cmd in commands:
    try:
        subprocess.run(cmd, shell=True, check=True)
        print(f"Deleted: {cmd}")
    except subprocess.CalledProcessError as e:
        print(f"Error: {cmd} - {e}")

# Commit the changes
subprocess.run("git add -A", shell=True, check=True)
subprocess.run("git commit -m 'Delete archive recommend folders from 20260520 to 20260616'", shell=True, check=True)
subprocess.run("git push origin main", shell=True, check=True)

print("All recommend folders deleted successfully!")
