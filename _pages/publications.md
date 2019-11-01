---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
---

<!-- {% if author.googlescholar %}
  You can also find my articles on <u><a href="{{author.googlescholar}}">my Google Scholar profile</a>.</u>
{% endif %}
 -->
{% include base_path %}

First Author
===
{% for post in site.publications reversed %}
    {% if {{ post.authorrank }} == "first" %}
      {% include archive-single.html %}
    {% endif %}
{% endfor %}

Second Author
===
{% for post in site.publications reversed %}
    {% if {{ post.authorrank }} == "second" %}
      {% include archive-single.html %}
    {% endif %}
{% endfor %}


N-th Author
===
{% for post in site.publications reversed %}
    {% if {{ post.authorrank }} == "nth" %}
      {% include archive-single.html %}
    {% endif %}
{% endfor %}

