import yfinance as yf

def calculate_portfolio(holdings):
    total = 0

    result = []

    for item in holdings:
        ticker = yf.Ticker(item["symbol"])

        price = ticker.info.get("currentPrice", 0)

        value = price * item["quantity"]

        total += value

        result.append({
            "symbol": item["symbol"],
            "price": price,
            "quantity": item["quantity"],
            "value": value
        })

    return {
        "positions": result,
        "total": total
    }