import yfinance as yf

def compare_stocks(symbol1: str, symbol2: str):
    try:
        # 1. Sanitize inputs
        s1 = symbol1.strip().upper()
        s2 = symbol2.strip().upper()
        
        stock1 = yf.Ticker(s1)
        stock2 = yf.Ticker(s2)
        
        info1 = stock1.info or {}
        info2 = stock2.info or {}

        # 2. Extract price safely for Asset 1
        price1 = info1.get("currentPrice")
        if price1 is None:
            price1 = info1.get("regularMarketPrice") or info1.get("previousClose") or info1.get("navPrice")

        # 3. Extract price safely for Asset 2
        price2 = info2.get("currentPrice")
        if price2 is None:
            price2 = info2.get("regularMarketPrice") or info2.get("previousClose") or info2.get("navPrice")

        # 4. Safely compile metrics with type-guard rounding
        return {
            "stock1": {
                "symbol": s1,
                "name": info1.get("longName") or info1.get("shortName") or "N/A",
                "price": round(price1, 2) if isinstance(price1, (int, float)) else "N/A",
                "market_cap": info1.get("marketCap") or "N/A",
                "pe_ratio": round(info1.get("trailingPE"), 2) if isinstance(info1.get("trailingPE"), (int, float)) else "N/A",
            },
            "stock2": {
                "symbol": s2,
                "name": info2.get("longName") or info2.get("shortName") or "N/A",
                "price": round(price2, 2) if isinstance(price2, (int, float)) else "N/A",
                "market_cap": info2.get("marketCap") or "N/A",
                "pe_ratio": round(info2.get("trailingPE"), 2) if isinstance(info2.get("trailingPE"), (int, float)) else "N/A",
            }
        }

    except Exception as e:
        print(f"COMPARE ERROR ({symbol1} vs {symbol2}): {e}")
        return {
            "error": f"Failed to compare stocks: {str(e)}"
        }