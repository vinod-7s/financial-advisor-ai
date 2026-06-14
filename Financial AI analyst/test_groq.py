from dotenv import load_dotenv
import os

load_dotenv()

print("GROQ_API_KEY exists:", bool(os.getenv("GROQ_API_KEY")))

from phi.model.groq import Groq
print("Groq import successful")

from dotenv import load_dotenv
load_dotenv()

from phi.model.groq import Groq

model = Groq(id="llama3-70b-8192")
print("Groq model created successfully")