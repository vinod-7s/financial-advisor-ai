from backend.rag.query import search_pdf
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

from phi.agent import Agent
from phi.model.groq import Groq
from phi.tools.yfinance import YFinanceTools

print("GROQ KEY EXISTS:", bool(os.getenv("GROQ_API_KEY")))

finance_agent = Agent(
    model=Groq(
        id="llama-3.3-70b-versatile",
        api_key=os.getenv("GROQ_API_KEY")
    ),
    tools=[
        YFinanceTools(
            stock_price=True,
            analyst_recommendations=True,
            stock_fundamentals=True,
            company_news=True,
        )
    ],
    instructions=[
        "You are a helpful AI financial assistant.",
        "Answer questions about finance, stocks, companies, investing, crypto and business.",
        "If PDF context is provided, answer from it first.",
        "Provide clear and structured answers."
    ],
    markdown=True,
)


def ask_agent(question):
    try:
        response = finance_agent.run(question)

        if hasattr(response, "text") and response.text:
            return str(response.text)

        if hasattr(response, "content") and response.content:
            return str(response.content)

        return "Empty response"

    except Exception as e:
        return f"Error: {str(e)}"


def ask_pdf(question: str):

    result = search_pdf(question)

    context = result["context"]
    sources = result["sources"]

    prompt = f"""
Answer ONLY from the provided PDF context.

Context:
{context}

Question:
{question}
"""

    answer = ask_agent(prompt)

    return {
        "answer": answer,
        "sources": sources
    }
from backend.rag.query import search_pdf
from backend.services.stock_service import get_stock_info

def hybrid_research(question, symbol=None):

    pdf_result = search_pdf(question)

    context = pdf_result["context"]

    stock_data = ""

    if symbol:
        stock_data = str(get_stock_info(symbol))

    prompt = f"""
PDF Context:
{context}

Stock Data:
{stock_data}

Question:
{question}

Provide a detailed answer.
"""

    answer = ask_agent(prompt)

    return {
        "answer": answer,
        "sources": pdf_result["sources"]
    }
def is_finance_question(question: str):

    finance_keywords = [
        "stock",
        "market",
        "price",
        "apple",
        "tesla",
        "nvidia",
        "company",
        "ceo",
        "invest",
        "crypto",
        "revenue",
        "earnings",
        "share"
    ]

    q = question.lower()

    return any(
        word in q
        for word in finance_keywords
    )

def generate_report(symbol):

    stock = get_stock_info(symbol)

    prompt = f"""
Create a professional financial report.

Company:
{symbol}

Data:
{stock}

Include:

1. Executive Summary
2. Company Overview
3. Financial Analysis
4. Risks
5. Growth Opportunities
6. Investment Outlook
7. Conclusion

Use markdown.
"""

    return ask_agent(prompt)
def route_question(question: str):

    q = question.lower()

    finance_keywords = [
        "stock",
        "share",
        "market",
        "revenue",
        "profit",
        "earnings",
        "apple",
        "tesla",
        "nvidia",
        "investment",
        "crypto"
    ]

    pdf_keywords = [
        "assignment",
        "report",
        "document",
        "pdf",
        "chapter"
    ]

    if any(k in q for k in pdf_keywords):
        return "pdf"

    if any(k in q for k in finance_keywords):
        return "finance"

    return "general"