import requests

API_KEY = "2b35da380577467086d4583414699d99"

def get_financial_news():
    url = (
        f"https://newsapi.org/v2/everything?"
        f"q=stock%20market&language=en&sortBy=publishedAt"
        f"&apiKey={API_KEY}"
    )

    response = requests.get(url)

    data = response.json()

    return data["articles"][:10]