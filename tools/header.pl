use strict; use warnings;
# Writes the shared site header, phone menu, footer and web-font link into every page.
# Usage (Git Bash, from the repo root): perl tools/header.pl .
# Safe to re-run: it replaces the existing blocks instead of adding new ones.
my $root = shift or die "root";
my %ICON = (
  builder    => '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
  tool       => '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  categories => '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
);
my $SEARCH_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
my @TOOLS = (
  [builder    => 'builder.html',    'Gig Builder',           'Titles, tags, description and 3 packages, ready to paste', 'Start here'],
  [tool       => 'tool.html',       'Gig Health Check',      'Score your gig and compare it with strong gigs in your category', ''],
  [categories => 'categories.html', 'Category Intelligence', 'Keywords, tags and starting prices for 80 subcategories', ''],
);
# Same order as Fiverr's own category menu, so sellers find things where they expect them
my @GROUPS = ('Graphics & Design', 'Programming & Tech', 'Digital Marketing', 'Video & Animation', 'Writing & Translation',
              'Music & Audio', 'Business', 'Finance', 'AI Services', 'Data', 'Photography');
my @GUIDES = (
  ['blog/gig-title-mistakes.html', 'Gig title mistakes'],
  ['blog/pricing-without-race-to-bottom.html', 'Pricing without racing to the bottom'],
  ['blog/how-to-write-a-fiverr-gig-description.html', 'Writing a gig description'],
);
# page file => [path prefix, current key]
my %PAGES = (
  'index.html'      => ['', ''],
  'builder.html'    => ['', 'builder'],
  'tool.html'       => ['', 'tool'],
  'categories.html' => ['', 'categories'],
  'data.html'       => ['', ''],
  'blog/gig-title-mistakes.html'                    => ['../', 'guides'],
  'blog/pricing-without-race-to-bottom.html'        => ['../', 'guides'],
  'blog/how-to-write-a-fiverr-gig-description.html' => ['../', 'guides'],
);

sub svg { my $k = shift; qq{<svg viewBox="0 0 24 24" aria-hidden="true">$ICON{$k}</svg>} }
sub amp { my $s = shift; $s =~ s/&/&amp;/g; $s }
sub group_href { my ($p, $g) = @_; my $q = $g; $q =~ s/&/%26/g; $q =~ s/ /%20/g; "${p}categories.html?group=$q" }

my $BRAND = qq{<span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 12h4l2-5 4 10 2-5h6"/></svg></span>\n      <span class="brand-word">Gig<span>Health</span>Check</span>};

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
  my $strip = join '', map { qq{<a href="}.group_href($p, $_).qq{" data-group="}.amp($_).qq{">}.amp($_).qq{</a>} } @GROUPS;
  my $toolsCur = $isTool ? ' is-current' : '';
  my $guidesCur = $cur eq 'guides' ? ' is-current" aria-current="true' : '';
  return <<"HTML";
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="header-inner">
    <a href="${p}index.html" class="brand" aria-label="GigHealthCheck home">
      $BRAND
    </a>
    <form class="hdr-search" action="${p}categories.html" role="search">
      <input name="q" type="search" placeholder="Search 80 Fiverr categories…" aria-label="Search categories">
      <button type="submit" aria-label="Search">$SEARCH_SVG</button>
    </form>
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
      <a class="btn header-cta" href="${p}builder.html">Build free</a>
      <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu"><span></span><span></span></button>
    </div>
  </div>
  <nav class="cat-strip" aria-label="Categories"><div class="cat-strip-inner">$strip</div></nav>
  <div class="scroll-progress" aria-hidden="true"><i></i></div>
</header>
<div class="mobile-menu" id="mobile-menu">
  <div class="mm-inner">
    <form class="mm-search" action="${p}categories.html" role="search">
      <input name="q" type="search" placeholder="Search 80 Fiverr categories…" aria-label="Search categories">
      <button type="submit" aria-label="Search">$SEARCH_SVG</button>
    </form>
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

sub footer_html {
  my ($p) = @_;
  my $cats = join "\n", map { qq{          <li><a href="}.group_href($p, $_).qq{">}.amp($_).qq{</a></li>} } @GROUPS[0 .. 7];
  my $tools = join "\n", map { qq{          <li><a href="$p$_->[1]">$_->[2]</a></li>} } @TOOLS;
  my $guides = join "\n", map { qq{          <li><a href="$p$_->[0]">$_->[1]</a></li>} } @GUIDES;
  return <<"HTML";
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-cols">
      <div>
        <h3>Categories</h3>
        <ul>
$cats
          <li><a href="${p}categories.html">All 80 subcategories →</a></li>
        </ul>
      </div>
      <div>
        <h3>Free tools</h3>
        <ul>
$tools
          <li><a href="${p}index.html#finder">Quick title check</a></li>
        </ul>
      </div>
      <div>
        <h3>Seller guides</h3>
        <ul>
$guides
        </ul>
      </div>
      <div>
        <h3>About</h3>
        <ul>
          <li><a href="${p}data.html">How our data works</a></li>
          <li><a href="${p}index.html#pricing">Pricing</a></li>
          <li><a href="${p}index.html#makeover">Gig Makeover</a></li>
          <li><a href="${p}index.html#capture">Growth Intelligence waitlist</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <a href="${p}index.html" class="brand" aria-label="GigHealthCheck home">
      $BRAND
      </a>
      <p>© 2026 GigHealthCheck. An independent tool for Fiverr sellers. Not affiliated with or endorsed by Fiverr International Ltd.</p>
    </div>
  </div>
</footer>
HTML
}

sub slurp { local $/; open my $f, '<:raw', $_[0] or die "open $_[0]"; my $s = <$f>; close $f; $s }
sub spit  { open my $o, '>:raw', $_[0] or die; print $o $_[1]; close $o }

for my $file (sort keys %PAGES) {
  my ($p, $cur) = @{ $PAGES{$file} };
  my $path = "$root/$file";
  my $s = slurp($path);
  my $h = header_html($p, $cur); $h =~ s/\n$//;
  my $f = footer_html($p);       $f =~ s/\n$//;

  # Header + phone menu (replace whatever is there now)
  $s =~ s{(?:<a class="skip-link".*?</a>\r?\n)?<header class="site-header">.*?</header>(?:\r?\n<div class="mobile-menu" id="mobile-menu">.*?\n</div>\r?\n  </div>\r?\n</div>|\r?\n<div class="mobile-menu" id="mobile-menu">.*?</div>\r?\n</div>)?}{$h}s
    or $s =~ s{<header>\s*<nav>.*?</nav>\s*</header>}{$h}s
    or die "no header in $file";

  # Footer
  $s =~ s{<footer class="site-footer">.*?</footer>}{$f}s
    or $s =~ s{<footer>.*?</footer>}{$f}s
    or die "no footer in $file";

  # Web font (Figtree), once, right before the site stylesheet
  unless ($s =~ /family=Figtree/) {
    my $font = qq{<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght\@400;500;600;700;800&display=swap">\n};
    $s =~ s{(<link rel="stylesheet" href="\Q$p\Eassets/site.css">)}{$font$1} or die "no site.css link in $file";
  }

  # Skip-link target
  if ($file eq 'index.html') { $s =~ s{<section class="hero"(?![^>]*id="main")}{<section class="hero" id="main"}; }
  elsif ($file =~ m{^blog/}) { $s =~ s{<article class="wrap">}{<article class="wrap" id="main">} unless $s =~ /id="main"/; }
  else { $s =~ s{<main class="page">}{<main class="page" id="main">} unless $s =~ /id="main"/; }

  spit($path, $s);
  print "$file ok\n";
}
