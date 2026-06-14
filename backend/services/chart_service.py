import yfinance as yf

def get_chart_data(symbol):
    stock = yf.Ticker(symbol)
    hist = stock.history(period="1mo")

    data = []

    for date, row in hist.iterrows():
        data.append({
            "date": str(date.date()),
            "price": round(row["Close"], 2)
        })

    return data