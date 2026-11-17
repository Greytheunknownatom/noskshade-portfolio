#!/usr/bin/env python3
"""Convert a block of the old x-dc template (inline styles, {{ }} bindings, sc-if / sc-for)
into JSX that keeps every style exactly as it was.

Usage: python3 tools/dc2jsx.py <index.html> <startLine> <endLine> [--vars v] > out.jsx
  Bindings like {{ blogFeat.title }} become {v.blogFeat.title}; loop variables stay bare.
  style-hover="..." becomes a generated className, its CSS is written to stderr.
LEARN: this is a one-off migration tool, not part of the site. See LEARN.md, lesson 2.
"""
import re, sys, hashlib, html

SVG_ATTRS = {'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin',
             'stroke-dasharray': 'strokeDasharray', 'stop-color': 'stopColor', 'stop-opacity': 'stopOpacity',
             'text-anchor': 'textAnchor', 'font-size': 'fontSize', 'font-weight': 'fontWeight', 'font-family': 'fontFamily',
             'fill-opacity': 'fillOpacity', 'stroke-opacity': 'strokeOpacity', 'fill-rule': 'fillRule', 'clip-rule': 'clipRule',
             'clip-path': 'clipPath', 'stroke-miterlimit': 'strokeMiterlimit', 'dominant-baseline': 'dominantBaseline',
             'class': 'className', 'for': 'htmlFor', 'tabindex': 'tabIndex', 'readonly': 'readOnly', 'xlink:href': 'href',
             'srcset': 'srcSet', 'crossorigin': 'crossOrigin', 'colspan': 'colSpan', 'rowspan': 'rowSpan', 'maxlength': 'maxLength',
             'autocomplete': 'autoComplete', 'enterkeyhint': 'enterKeyHint', 'inputmode': 'inputMode', 'fetchpriority': 'fetchPriority'}
VOID = {'img', 'input', 'br', 'hr', 'meta', 'link', 'source', 'col', 'wbr'}
BIND = re.compile(r'\{\{\s*(.*?)\s*\}\}')

hover_css = {}
loop_vars = []
prefix = 'v'


def expr(e):
    e = e.strip()
    if e in ('true', 'false') or re.fullmatch(r'-?\d+(\.\d+)?', e):
        return e
    root = re.split(r'[.\[]', e, maxsplit=1)[0]
    if root in loop_vars:
        return e
    return f'{prefix}.{e}'


def interp(val):
    """attribute/style value with {{ }} -> JS expression string"""
    parts = BIND.split(val)
    if len(parts) == 3 and parts[0] == '' and parts[2] == '':
        return expr(parts[1])
    out = []
    for i, p in enumerate(parts):
        if i % 2:
            out.append('${' + expr(p) + '}')
        else:
            out.append(p.replace('`', '\\`').replace('${', '\\${'))
    return '`' + ''.join(out) + '`'


def style_obj(s):
    items = []
    # split on ; not inside parentheses
    depth, cur, decls = 0, '', []
    for ch in s:
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        if ch == ';' and depth == 0:
            decls.append(cur); cur = ''
        else:
            cur += ch
    decls.append(cur)
    for d in decls:
        if ':' not in d:
            continue
        k, val = d.split(':', 1)
        k, val = k.strip(), val.strip()
        if not k:
            continue
        if k.startswith('--'):
            key = repr(k)
        else:
            if k.startswith('-webkit-'):
                k = 'Webkit-' + k[8:]
            key = re.sub(r'-([a-zA-Z])', lambda m: m.group(1).upper(), k)
        v = interp(val) if BIND.search(val) else repr(val) if not val.replace('.', '', 1).isdigit() else val
        if not BIND.search(val):
            if re.fullmatch(r'-?\d+(\.\d+)?', val):
                v = val
            else:
                v = "'" + val.replace('\\', '\\\\').replace("'", "\\'") + "'"
        items.append(f'{key}: {v}')
    return '{{ ' + ', '.join(items) + ' }}'


def hover_class(css):
    h = 'hv' + hashlib.md5(css.encode()).hexdigest()[:6]
    rules = ';'.join(d.strip() + ' !important' for d in css.split(';') if d.strip())
    hover_css[h] = f'.{h}:hover{{{rules}}}'
    return h


ATTR = re.compile(r'''([:\w@.-]+)(?:\s*=\s*("([^"]*)"|'([^']*)'))?''')


def conv_attrs(tag, raw):
    out, classes = [], []
    for m in ATTR.finditer(raw):
        name = m.group(1)
        val = m.group(3) if m.group(3) is not None else m.group(4)
        if name == 'style-hover':
            classes.append(hover_class(val)); continue
        if name == 'style':
            out.append('style=' + style_obj(val)); continue
        if name == 'class':
            classes.append(val); continue
        jname = SVG_ATTRS.get(name, name)
        if name.startswith('on') and len(name) > 2:
            jname = 'on' + name[2].upper() + name[3:]
        if val is None:
            out.append(jname); continue
        if jname == 'draggable':
            out.append('draggable={false}' if val == 'false' else 'draggable'); continue
        if BIND.search(val):
            out.append(f'{jname}={{{interp(val)}}}')
        else:
            out.append(f'{jname}="{val}"')
    if classes:
        out.insert(0, f'className="{" ".join(classes)}"')
    return (' ' + ' '.join(out)) if out else ''


def conv_text(t):
    def rep(m):
        return '{' + expr(m.group(1)) + '}'
    parts = BIND.split(t)
    out = []
    for i, p in enumerate(parts):
        if i % 2:
            out.append('{' + expr(p) + '}')
        else:
            out.append(p.replace('{', "{'{'}").replace('}', "{'}'}"))
    return ''.join(out)


TOKEN = re.compile(r'<!--(.*?)-->|<(/?)([a-zA-Z][\w-]*)((?:[^>"\']|"[^"]*"|\'[^\']*\')*?)(/?)>', re.S)


def convert(src):
    out, pos, stack = [], 0, []
    for m in TOKEN.finditer(src):
        out.append(conv_text(src[pos:m.start()]))
        pos = m.end()
        if m.group(1) is not None:
            out.append('{/*' + m.group(1).replace('*/', '') + '*/}'); continue
        closing, tag, attrs, selfc = m.group(2), m.group(3), m.group(4), m.group(5)
        if tag == 'sc-if':
            if closing:
                if not stack: continue
                out.append('</>)}'); stack.pop()
            else:
                cond = re.search(r'value="\{\{\s*(.*?)\s*\}\}"', attrs).group(1)
                out.append('{' + expr(cond) + ' && (<>'); stack.append('if')
            continue
        if tag == 'sc-for':
            if closing:
                out.append('</React.Fragment>))}'); loop_vars.pop(); stack.pop()
            else:
                lst = re.search(r'list="\{\{\s*(.*?)\s*\}\}"', attrs).group(1)
                var = re.search(r'as="(\w+)"', attrs).group(1)
                out.append('{' + expr(lst) + f'.map(({var}, {var}I) => (<React.Fragment key={{{var}I}}>')
                loop_vars.append(var); stack.append('for')
            continue
        if tag == 'image-slot':
            if closing:
                continue
            m2 = re.search(r'\ssrc="([^"]*)"', attrs)
            ph = re.search(r'placeholder="([^"]*)"', attrs)
            fit = re.search(r'fit="([^"]*)"', attrs)
            if m2:
                isrc = m2.group(1)  # (not `src`: that name holds the whole template being converted)
                srcx = '{' + interp(isrc) + '}' if BIND.search(isrc) else '"' + ('/' + isrc if not isrc.startswith('/') else isrc) + '"'
                out.append(f'<img data-imageslot="1" src={srcx} alt="{(ph.group(1) if ph else "")}" loading="lazy" decoding="async" draggable={{false}} style={{{{ position: \'absolute\', inset: 0, width: \'100%\', height: \'100%\', objectFit: \'{fit.group(1) if fit else "cover"}\', display: \'block\' }}}} />')
            else:
                out.append(f'<div data-imageslot="1" data-soon="1" role="img" aria-label="{(ph.group(1) if ph else "Image coming soon")}" style={{{{ position: \'absolute\', inset: 0 }}}}></div>')
            continue
        if closing:
            if tag in VOID:
                continue
            out.append(f'</{tag}>'); continue
        a = conv_attrs(tag, attrs)
        if tag in VOID or selfc:
            if tag == 'img':
                a = a.replace('src="assets/', 'src="/assets/')
            out.append(f'<{tag}{a} />')
        else:
            out.append(f'<{tag}{a}>')
    out.append(conv_text(src[pos:]))
    return ''.join(out)


if __name__ == '__main__':
    path, a, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    if '--vars' in sys.argv:
        prefix = sys.argv[sys.argv.index('--vars') + 1]
    lines = open(path, encoding='utf-8').read().split('\n')[a - 1:b]
    print(convert('\n'.join(lines)))
    sys.stderr.write('\n'.join(hover_css.values()) + '\n')
