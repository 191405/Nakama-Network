import os
import re

# Simple stack-based JSX parser to find text strings outside <Text> components

ALLOWED_TEXT_TAGS = {'Text', 'TextInput', 'Animated.Text', 'GradientText', 'Markdown', 'Title', 'Subtitle', 'Caption', 'Label'}
# Add other text components if custom ones exist

def validate_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Simple tokenizer
    # We want to find: <Tag> Content </Tag>
    # We ignore props for now, just look at Tag Name
    
    lines = content.split('\n')
    errors = []
    
    # Heuristic: iterate lines, find text that looks like it's inside JSX but not inside Text
    # This is hard with regex line-by-line.
    # We will use a state machine char-by-char or regex on full content.
    
    # Regex to find tags and content
    # Capture: <tagName ...>, </tagName>, or Content
    # We need to handle nested tags.
    
    # Simplification: Find >TEXT<
    # And look backwards for the last opening tag.
    
    # Let's iterate through the file finding tags.
    tag_regex = re.compile(r'(<[/]?[a-zA-Z0-9_\.]+(?:>|\s[^>]*>))')
    
    # We will split content by tags
    parts = tag_regex.split(content)
    # parts[0] = content before first tag
    # parts[1] = first tag
    # parts[2] = content after first tag
    
    stack = []
    
    current_line = 1
    
    for i, part in enumerate(parts):
        # Update line count
        current_line += part.count('\n')
        
        if i % 2 == 1:
            # This is a tag
            tag_str = part.strip()
            is_closing = tag_str.startswith('</')
            is_self_closing = tag_str.endswith('/>')
            
            # Extract tag name
            if is_closing:
                name = re.match(r'</([a-zA-Z0-9_\.]+)', tag_str).group(1)
                # Pop from stack until we match name or run out
                # In React Native, mismatch is possible if we miss-parse
                if stack and stack[-1] == name:
                    stack.pop()
                elif stack:
                    # heuristic: maybe we missed a self-closing or parsing error
                    # pass
                    pass
            elif is_self_closing:
                # No stack change
                pass
            else:
                # Opening tag
                match = re.match(r'<([a-zA-Z0-9_\.]+)', tag_str)
                if match:
                    name = match.group(1)
                    stack.append(name)
        else:
            # This is Content
            text = part.strip()
            if not text:
                continue
            
            # Ignore comments {/* ... */}
            if text.startswith('{/*') and text.endswith('*/}'):
                continue
                
            # Ignore JS expressions slightly? 
            # If text starts with {, it's an expression.
            # React Native DOES allow {expression} inside View IF expression is null/false/component.
            # It specificially crashes on STRINGS inside View.
            
            # If text is literal string "Hello"
            # It's an error if stack[-1] is NOT in ALLOWED_TEXT_TAGS
            
            # If text is { ... }, we can't easily validte without JS parsing.
            # But we can check for { 'string' } or { "string" }
            
            parent = stack[-1] if stack else 'Root'
            if parent in ALLOWED_TEXT_TAGS:
                continue
                
            if parent == 'script': # standard html? React Native doesn't use script tags usually
                continue
                
            # Filter out known safe parents or patterns
            if parent == 'Svg' or parent == 'Path': # SVG text?
                continue
            
            # Determine if dangerous
            # 1. Literal text: "Hello"
            # 2. Expression: { ... }
            
            # Stricter filters
            if text.strip().startswith(('import ', 'export ', 'const ', 'let ', 'var ', 'function ', 'return', 'async ', 'await ')):
                continue

            if text.startswith('{'):
                # Check for risky string expressions
                if "&& '" in text or '&& "' in text or "? '" in text or '? "' in text:
                     # Risky
                     pass
                else:
                    # Assume safe JS block
                    continue
            
            # Skip likely JS syntax
            if re.match(r'^[a-zA-Z0-9_\(\)\s=\.]+$', text): 
                # e.g. "item.id" or "setVal(1)" or "console.log(x)"
                # If it's pure logic, unlikely to be rendered text unless it's a raw word like "Search"
                if ' ' not in text and len(text) < 20: 
                    # Single word? Could be text: <View>Search</View>
                    pass 
                elif '(' in text or '=' in text:
                    continue
                    
            if text in ['(', ')', ';', '}', '{', '/>']: continue
            
            errors.append(f"{filepath}: (approx line {current_line}) Text found in <{parent}>: '{text[:40]}...'")

    return errors

def scan_dir(directory):
    all_errors = []
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in root or '.expo' in root:
            continue
        for file in files:
            if file.endswith('.js'):
                path = os.path.join(root, file)
                errs = validate_file(path)
                all_errors.extend(errs)
    return all_errors

if __name__ == "__main__":
    target_dir = r"c:\Users\HP\Downloads\nk-network\mobile\src"
    results = scan_dir(target_dir)
    if results:
        print("Found possible Text outside <Text> components:")
        for e in results:
            print(e)
    else:
        print("No obvious text errors found.")
