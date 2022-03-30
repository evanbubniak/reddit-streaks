import re
import yaml
import os
import datetime

FM_BOUNDARY = re.compile(r"^-{3,}\s*$", re.MULTILINE)

posts_dir = "_posts"
posts = os.listdir(os.path.join(os.getcwd(), posts_dir))


for post_filename in posts:
    with open(os.path.join(posts_dir, post_filename), "r") as f:
        text = f.read()

    content: str
    fm_raw: str
    _, fm_raw, content = FM_BOUNDARY.split(text, 2)
    fm_raw = fm_raw.strip("\n")
    content = content.strip("\n")

    fm: dict = yaml.safe_load(fm_raw)
    title = fm['title']
    date = fm['date']
    chars_to_remove = [",", ".", "?", "«", "»"]
    def remove_chars(title):
        for char_to_remove in chars_to_remove:
            title = title.replace(char_to_remove, "")
        return title
    post_title_stripped = "-".join([token for token in remove_chars(title.lower()).split(" ") if token])
    new_filename = f"{date}-{post_title_stripped}.md"

    if post_filename != new_filename:
        # print(post_filename, new_filename)
        os.rename(os.path.join(posts_dir, post_filename), os.path.join(posts_dir, new_filename))
