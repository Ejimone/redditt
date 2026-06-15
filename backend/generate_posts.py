import json
import random

titles = [
    "Just launched my latest side project, what do you think?",
    "Why is everybody suddenly talking about this new framework?",
    "I spent 6 months building this tool and it failed. Here's what I learned.",
    "A comprehensive guide to understanding advanced concepts.",
    "What's your favorite underrated library right now?",
    "Can we stop pretending this feature is actually useful?",
    "I finally understood how to optimize my queries properly.",
    "Unpopular opinion: the old way was better.",
    "Help! I've been stuck on this error for 3 days.",
    "Here is a curated list of resources I found helpful.",
    "Just achieved a huge milestone today!",
    "Looking for advice on architecture for a large scale app.",
    "What are the best practices for handling authentication here?",
    "Is it worth upgrading to the latest version yet?",
    "Does anyone else hate the new documentation?",
    "This simple change improved our performance by 400%.",
    "How do you deal with burnout as a developer?",
    "Looking for open source projects to contribute to.",
    "Any tips for passing the technical interview?",
    "I am open sourcing my entire portfolio of apps today."
]

bodies = [
    "I would love to get your thoughts and feedback on this. I've been working on it for a while and feel like it's finally ready for the world.",
    "It feels like overnight there's this massive hype train. Is it justified, or just another fad?",
    "Failure hurts, but I wanted to write down the post-mortem so others don't make the exact same mistakes I did.",
    "After struggling with this for weeks, everything finally clicked. I wrote this guide to help beginners navigate the complex parts.",
    "I stumbled across it on GitHub with only 200 stars. It solved a massive headache for us. Highly recommend looking into it.",
    "Seriously, the DX is terrible and it introduces more problems than it solves. Just use the standard native tooling instead.",
    "The official docs are kind of sparse, so I created a minimal reproducible example to demonstrate exactly how the caching layer works.",
    "We migrated our entire codebase to the new paradigm and honestly, I wish we hadn't. Everything is more complicated now.",
    "I've read through every StackOverflow thread and GitHub issue. Has anyone encountered this specific edge case before?",
    "I compiled all the docs, videos, and articles that actually made sense. Bookmark this if you are currently learning in this space.",
    "Just passed 10k MRR and I wanted to walk through my journey of getting my first 100 customers without spending a dime on marketing.",
    "We are anticipating a huge spike in traffic next month and our current monolithic setup probably won't hold up. Suggestions?",
    "Should we use cookies, local storage, or JWTs? Which library is the industry standard for this right now?",
    "I want to tap into the new features, but I've heard the migration path is full of breaking changes.",
    "It used to be so straightforward, but now everything is hidden behind three layers of abstraction and confusing terminology.",
    "By simply lazy-loading the components below the fold, our Time to Interactive plummeted. Highly recommended optimization.",
    "I've been coding 12 hours a day and the passion is completely gone. How do you guys unplug and reset your mental state?",
    "I am a mid-level developer looking to give back, what are some active repositories looking for help with issue triage and minor bugs?",
    "I have been grinding LeetCode but I always freeze up when doing system design. Any proven frameworks for structuring my answers?",
    "I realized I wasn't going to monetize these properly, so they are now fully MIT licensed. Feel free to use the code."
]

tags = ["nextjs", "strapi", "typescript", "javascript", "reactjs", "python", "css", "html", "aws", "docker"]

res = []
for i in range(65):
    t = random.choice(titles)
    b = random.choice(bodies)
    s = random.choice(tags)
    res.append({
        "title": t,
        "slug": f"post-{i}",
        "content": b,
        "subredditSlug": s,
        "score": random.randint(5, 500)
    })

print(json.dumps(res, indent=2))
