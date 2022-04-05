chars_to_remove = [",", ".", "?", "«", "»","「","」","(",")", "\"","：","？"]
def remove_chars(title):
    for char_to_remove in chars_to_remove:
        title = title.replace(char_to_remove, "")
    return title
