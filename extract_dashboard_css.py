import re

with open('src/global.css', 'r') as f:
    css_content = f.read()

# We will look for top-level CSS rules that match our target classes.
# This is a basic parser that works well for standard CSS.

keywords = [
    'kpi-grid', 'kpi-card', 'kpi-title', 'kpi-value',
    'dashboard-view', 'dashboard-kpi', 'desktop-landscape-view',
    'mobile-portrait-view', 'priority-card', 'p-card'
]

# We want to match whole blocks: .class { ... }
# Because of media queries, it's tricky to parse with regex perfectly.
# So we will just find the blocks and extract them.
# For media queries, we should extract the media query if it contains these.

import cssutils
import logging

cssutils.log.setLevel(logging.CRITICAL)

sheet = cssutils.parseString(css_content)

global_rules = []
dashboard_rules = []

def has_target_class(selectorText):
    for kw in keywords:
        if kw in selectorText:
            return True
    return False

for rule in sheet:
    if rule.type == rule.STYLE_RULE:
        if has_target_class(rule.selectorText):
            dashboard_rules.append(rule.cssText)
        else:
            global_rules.append(rule.cssText)
    elif rule.type == rule.MEDIA_RULE:
        # Check inside media rule
        global_media = []
        dashboard_media = []
        for inner in rule.cssRules:
            if inner.type == inner.STYLE_RULE and has_target_class(inner.selectorText):
                dashboard_media.append(inner.cssText)
            else:
                global_media.append(inner.cssText)
        
        if dashboard_media:
            # We recreate the media rule for dashboard
            media_text = f"@media {rule.media.mediaText} {{\n" + "\n".join(dashboard_media) + "\n}"
            dashboard_rules.append(media_text)
        
        if global_media:
            media_text = f"@media {rule.media.mediaText} {{\n" + "\n".join(global_media) + "\n}"
            global_rules.append(media_text)
    else:
        global_rules.append(rule.cssText)

with open('src/components/DashboardView.module.css', 'w') as f:
    f.write("\n\n".join(dashboard_rules))

with open('src/global.css', 'w') as f:
    f.write("\n\n".join(global_rules))

print("Extraction complete.")
