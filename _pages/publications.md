---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
header:
  overlay_image: Marbled_2.jpg
---

{% if site.author.orcid %}
  You can also find my articles on <u><a href="{{site.author.orcid}}">my orcid profile</a>.</u>
{% endif %}

{% if site.author.googlescholar %}
  Or, if you prefer, you can find my articles on <u><a href="{{site.author.googlescholar}}">my google scholar profile</a>.</u>
{% endif %}

Or, if those aren't to you liking then you can find my articles on <u><a href="https://ui.adsabs.harvard.edu/public-libraries/xhnvsk6JRsC7Ljzg8ToqVQ">ADS</a>.</u>

{% include base_path %}

A full list of my publications can be found [here](http://dfielding14.github.io/files/DBF_CV-Publist.pdf){:target="_blank"}, which was last updated 31 Oct 2022.

<!-- 

First Author
====
{% for post in site.publications reversed %}
    {% if post.authorrank == "first" %}
      {% include archive-single.html %}
    {% endif %}
{% endfor %}

Papers led by students I mentored
====
{% for post in site.publications reversed %}
    {% if post.authorrank == "student" %}
      {% include archive-single.html %}
    {% endif %}
{% endfor %}

Second Author
====
{% for post in site.publications reversed %}
    {% if post.authorrank == "second" %}
      {% include archive-single.html %}
    {% endif %}
{% endfor %}

N-th Author
====
{% for post in site.publications reversed %}
    {% if post.authorrank == "nth" %}
      {% include archive-single.html %}
    {% endif %}
{% endfor %}

 -->