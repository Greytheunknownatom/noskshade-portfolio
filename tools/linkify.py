"""Turn elements whose onClick goes to a main page (onClick={v.navWork} etc.) into real <Link href>,
so Google can follow them. Every other onClick (sliders, lightbox, next case…) is left as it is."""
import re, sys

ROUTES = {'navHome': '/', 'navWork': '/work', 'goBlog': '/blog', 'navAbout': '/about', 'navContact': '/contact',
          'goHomeLink': '/', 'goContactLink': '/contact'}
OPEN = re.compile(r'<(div|a)((?:[^>{}]|\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})*?)\sonClick=\{v\.(\w+)\}')


def linkify(s):
    pos = 0
    while True:
        m = OPEN.search(s, pos)
        if not m:
            return s
        if m.group(3) not in ROUTES:
            pos = m.end()
            continue
        tag, route = m.group(1), ROUTES[m.group(3)]
        i, depth = m.end(), 1
        pat = re.compile(rf'<{tag}[\s>]|</{tag}>')
        while depth:
            n = pat.search(s, i)
            depth += -1 if n.group().startswith('</') else 1
            i = n.end()
        close_start = i - len(f'</{tag}>')
        attrs = re.sub(r'\shref="[^"]*"', '', m.group(2))
        s = s[:m.start()] + f'<Link href="{route}"{attrs}' + s[m.end():close_start] + '</Link>' + s[i:]
        pos = m.start() + 1


print(linkify(open(sys.argv[1]).read()))
