chars_to_remove = [",", ".", "?", "«", "»","「","」","(",")", "\"","：","？","“","”"]
chars_to_space = ["'"]
def remove_chars(title):
    for char_to_remove in chars_to_remove:
        title = title.replace(char_to_remove, "")
    for char_to_space in chars_to_space:
        title = title.replace(char_to_space, " ")
    return title
