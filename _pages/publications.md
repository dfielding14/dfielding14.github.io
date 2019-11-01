---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
---

{% if site.author.orcid %}
  You can also find my articles on <u><a href="{{site.author.orcid}}">my orcid profile</a>.</u>
{% endif %}


{% include base_path %}

### First Author
{% for post in site.publications reversed %}
    {% if post.authorrank == "first" %}
      {% include archive-single.html %}
    {% endif %}
{% endfor %}

### Second Author
{% for post in site.publications reversed %}
    {% if post.authorrank == "second" %}
      {% include archive-single.html %}
    {% endif %}
{% endfor %}


### N-th Author
{% for post in site.publications reversed %}
    {% if post.authorrank == "nth" %}
      {% include archive-single.html %}
    {% endif %}
{% endfor %}

