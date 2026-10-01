use strict; use warnings;
# Writes the shared site header into every page.
# Usage (Git Bash, from the repo root): perl tools/header.pl .
# Safe to re-run: it replaces the existing header block instead of adding another.
my $root = shift or die "root";
my %ICON = (
  builder    => '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
  tool       => '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  categories => '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
);
my @TOOLS = (
  [builder    => 'builder.html',    'Gig Builder',           'Titles, tags, description and 3 packages, ready to paste', 'Start here'],
  [tool       => 'tool.html',       'Gig Health Check',      'Score your gig and compare it with strong gigs in your category', ''],
  [categories => 'categories.html', 'Category Intelligence', 'Keywords, tags and starting prices for 80 subcategories', ''],
);
# page file => [path prefix, current key]
my %PAGES = (
  'index.html'      => ['', ''],
  'builder.html'    => ['', 'builder'],
  'tool.html'       => ['', 'tool'],
  'categories.html' => ['', 'categories'],
  'data.html'       => ['', ''],
  'blog/gig-title-mistakes.html'                 => ['../', 'guides'],
  'blog/pricing-without-race-to-bottom.html'     => ['../', 'guides'],
  'blog/how-to-write-a-fiverr-gig-description.html' => ['../', 'guides'],
);

sub svg { my $k = shift; qq{<svg viewBox="0 0 24 24" aria-hidden="true">$ICON{$k}</svg>} }

sub header_html {
  my ($p, $cur) = @_;
  my $isTool = grep { $_->[0] eq $cur } @TOOLS;
  my $cur_attr = sub { $_[0] eq $cur ? ' aria-current="page"' : '' };
  my $mega = join "\n", map {
    my ($k, $href, $name, $desc, $badge) = @$_;
    my $b = $badge ? qq{ <em>$badge</em>} : '';
    qq{          <a class="mega-item" href="$p$href}.'"'.$cur_attr->($k).qq{><span class="mi-icon">}.svg($k).qq{</span><span><b>$name$b</b><small>$desc</small></span></a>}
  } @TOOLS;
  my $mm = join "\n", map {
    my ($k, $href, $name, $desc) = @$_;
    qq{    <a class="mm-tool" href="$p$href}.'"'.$cur_attr->($k).qq{><span class="mi-icon">}.svg($k).qq{</span><span><b>$name</b><small>$desc</small></span></a>}
  } @TOOLS;
  my $toolsCur = $isTool ? ' is-current' : '';
  my $guidesCur = $cur eq 'guides' ? ' is-current" aria-current="true' : '';
  return <<"HTML";
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="header-inner">
    <a href="${p}index.html" class="brand" aria-label="GigHealthCheck home">
      <span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 12h4l2-5 4 10 2-5h6"/></svg></span>
      <span class="brand-word">Gig<span>Health</span>Check</span>
    </a>
    <nav class="site-nav" aria-label="Main">
      <span class="nav-glide" aria-hidden="true"></span>
      <div class="nav-item has-menu">
        <button type="button" class="nav-link$toolsCur" aria-expanded="false" aria-controls="menu-tools">Free tools <svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
        <div class="mega" id="menu-tools">
$mega
          <div class="mega-foot"><span>Free · No signup · No Fiverr login</span><a href="${p}index.html#finder">Quick title check →</a></div>
        </div>
      </div>
      <a class="nav-link$guidesCur" href="${p}index.html#guides">Guides</a>
      <a class="nav-link" href="${p}index.html#pricing">Pricing</a>
    </nav>
    <div class="header-actions">
      <a class="btn header-cta" href="${p}builder.html">Build free <span aria-hidden="true">→</span></a>
      <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu"><span></span><span></span></button>
    </div>
  </div>
  <div class="scroll-progress" aria-hidden="true"><i></i></div>
</header>
<div class="mobile-menu" id="mobile-menu">
  <div class="mm-inner">
    <p class="mm-label">Free tools</p>
$mm
    <p class="mm-label">More</p>
    <a class="mm-link" href="${p}index.html#guides">Seller guides</a>
    <a class="mm-link" href="${p}index.html#pricing">Pricing</a>
    <a class="mm-link" href="${p}index.html#makeover">Gig Makeover</a>
    <a class="mm-link" href="${p}data.html">How our data works</a>
    <a class="btn mm-cta" href="${p}builder.html">Build my gig free →</a>
    <p class="mm-note">Free · No signup · No Fiverr login</p>
  </div>
</div>
HTML
}

sub slurp { local $/; open my $f, '<:raw', $_[0] or die "open $_[0]"; my $s = <$f>; close $f; $s }
sub spit  { open my $o, '>:raw', $_[0] or die; print $o $_[1]; close $o }

for my $file (sort keys %PAGES) {
  my ($p, $cur) = @{ $PAGES{$file} };
  my $path = "$root/$file";
  my $s = slurp($path);
  my $h = header_html($p, $cur);
  $h =~ s/\n$//;

  # Replace whatever header is there now (a previous run's full block, the app header, or the old blog header)
  $s =~ s{(?:<a class="skip-link".*?</a>\r?\n)?<header class="site-header">.*?</header>(?:\r?\n<div class="mobile-menu" id="mobile-menu">.*?\n</div>\r?\n  </div>\r?\n</div>|\r?\n<div class="mobile-menu" id="mobile-menu">.*?</div>\r?\n</div>)?}{$h}s
    or $s =~ s{<header>\s*<nav>.*?</nav>\s*</header>}{$h}s
    or die "no header in $file";

  # Skip-link target
  if ($file eq 'index.html') { $s =~ s{<div class="hero">}{<div class="hero" id="main">} unless $s =~ /class="hero" id="main"/; }
  elsif ($file =~ m{^blog/}) { $s =~ s{<article class="wrap">}{<article class="wrap" id="main">} unless $s =~ /id="main"/; }
  else { $s =~ s{<main class="page">}{<main class="page" id="main">} unless $s =~ /id="main"/; }

  # Blog articles: pull in the shared styles + header script, drop their old header rules
  if ($file =~ m{^blog/}) {
    unless ($s =~ m{\.\./assets/site\.css}) {
      $s =~ s{<style>}{<link rel="stylesheet" href="../assets/site.css">\n<script>document.documentElement.classList.add('js')</script>\n<script src="../assets/motion.js" defer></script>\n<style>};
    }
    $s =~ s{\r?\n  header\{padding:20px;border-bottom:1px solid var\(--border\)\}}{};
    $s =~ s{\r?\n  nav\{max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center\}}{};
    $s =~ s{\r?\n  \.brand\{font-weight:700;font-size:18px;text-decoration:none;color:var\(--text\)\}}{};
    $s =~ s{\r?\n  \.brand span\{color:var\(--accent-2\)\}}{};
    $s =~ s{\r?\n  nav a\.tool-link\{[^\n]*\}}{};
  }
  spit($path, $s);
  print "$file ok\n";
}
