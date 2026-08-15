import json

data_path = r'c:\Users\dell\Desktop\Eagle-Revolution\src\src\data\completeData.json'

with open(data_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

data['serviceDetailPage'] = {
    "trustBanner": {
        "badge": "Why Choose Us",
        "headline": "America's #1 Rated Home Improvement Team",
        "description": "Join thousands of satisfied homeowners who trusted us with their most valuable investment.",
        "badges": ["A+ BBB Rating", "24/7 Support", "Free Estimates"],
        "cta": {
            "primary": "Get Free Quote",
            "secondary": "Call Now: 636-449-9714",
            "phone": "636-449-9714"
        }
    },
    "methodology": {
        "badge": "Methodology",
        "headline": "Precision in every detail",
        "description": "A battle-tested framework that ensures consistency, quality, and complete satisfaction—from initial consultation to final walkthrough."
    },
    "faq": {
        "badge": "FAQ",
        "headline": "Your Questions, Answered"
    },
    "explore": {
        "badge": "Our Portfolio",
        "headline": "Explore More Services",
        "description": "Discover our full range of premium home improvement solutions",
        "cta": "Learn More",
        "viewAll": "View All Services"
    }
}

with open(data_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print("Updated completeData.json with serviceDetailPage content.")
