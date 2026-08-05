import re
import os

# 需要修复的文件列表
files_to_fix = [
    'about.html', 'contact.html', 'cookie-policy.html', 
    'disclaimer.html', 'privacy.html', 'terms.html', 'article.html',
    'articles-general.html', 'articles-hk.html', 'articles-tw.html'
]

for filename in files_to_fix:
    if not os.path.exists(filename):
        print(f"跳过 {filename} - 文件不存在")
        continue
        
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 检查是否已有页脚Logo的img样式定义
    has_footer_logo_img = '.foot-brand .brand-logo img' in content
    
    if not has_footer_logo_img:
        # 需要添加页脚Logo img样式
        # 查找 .foot-brand 相关样式块
        foot_brand_pattern = r'(\.foot-brand\s*\{[^}]+\})'
        match = re.search(foot_brand_pattern, content)
        
        if match:
            insert_pos = match.end()
            # 在 .foot-brand 样式后添加页脚Logo img样式
            footer_logo_css = '\n  .foot-brand .brand-logo img { width: 56px; height: 56px; border-radius: 10px; }'
            content = content[:insert_pos] + footer_logo_css + content[insert_pos:]
            print(f"✓ {filename}: 添加页脚Logo img样式 (56px)")
    else:
        # 已有样式，检查是否需要修改尺寸
        # 查找 .foot-brand .brand-logo img 的定义
        footer_logo_pattern = r'\.foot-brand\s+\.brand-logo\s+img\s*\{([^}]+)\}'
        match = re.search(footer_logo_pattern, content)
        
        if match:
            css_content = match.group(1)
            # 检查是否是48px
            if '48px' in css_content:
                # 替换为56px
                new_css = css_content.replace('48px', '56px').replace('8px', '10px')
                content = content[:match.start(1)] + new_css + content[match.end(1):]
                print(f"✓ {filename}: 页脚Logo尺寸 48px → 56px")
            else:
                print(f"- {filename}: 页脚Logo尺寸已正确")
        else:
            print(f"? {filename}: 未找到页脚Logo img样式定义")
    
    if content != original:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)

print("\n修复完成！")
