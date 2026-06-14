import yfinance as yf

def get_stock_info(symbol: str):
    try:
        # 1. Clean up and sanitize the input ticker string
        ticker_str = symbol.strip().upper()
        if not ticker_str:
            return {"error": "Ticker symbol cannot be empty."}
            
        stock = yf.Ticker(ticker_str)
        info = stock.info
        
        # 2. Guard against empty or failed API responses
        if not info or len(info) <= 1:
            return {"error": f"Could not find valid data for symbol: {ticker_str}"}

        # 3. Comprehensive price fallback framework
        price = info.get("currentPrice")
        if price is None:
            price = (
                info.get("regularMarketPrice") 
                or info.get("previousClose") 
                or info.get("navPrice")
            )

        # 4. Safely extract and format metrics
        return {
            "symbol": ticker_str,
            "name": info.get("longName") or info.get("shortName") or "N/A",
            "price": round(price, 2) if isinstance(price, (int, float)) else "N/A",
            "market_cap": info.get("marketCap") or "N/A",
            "pe_ratio": round(info.get("trailingPE"), 2) if isinstance(info.get("trailingPE"), (int, float)) else "N/A",
            "sector": info.get("sector") or "N/A",
        }

    except Exception as e:
        print(f"YFINANCE ERROR FOR {symbol}: {e}")
        return {
            "error": f"Failed to fetch stock data: {str(e)}"
        }