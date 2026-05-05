from typing import List, Optional
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from model import llm_model

class UserInterest(BaseModel):
    """
    Represent an extracted user interest
    """
    interest: str = Field(..., description="The name of the interest or topic (e.g., 'Baking', 'AI Agents')")
    category: str = Field(..., description="A general category for this interest (e.g., 'Food', 'Technology')")
    confidence: float = Field(..., description="Confidence score from 0 to 1")

class UserProfile(BaseModel):
    """
    List of interests extracted from a query
    """
    interests: List[UserInterest] = Field(..., description="List of topics the user is interested in based on their question")

# Structured LLM for extraction using the main Groq model
structured_llm_profiler = llm_model.with_structured_output(UserProfile)

system = """
    You are an expert at user profiling and interest mapping.
    Analyze the user's question and extract a list of core interests, hobbies, or professional topics they are currently focused on.
    Be specific but concise. For example, if they ask about 'vegan cake', the interest is 'Vegan Baking'.
    Categorize each interest into broad segments like 'Technology', 'Food', 'Health', 'Finance', etc.
"""

profile_prompt = ChatPromptTemplate.from_messages([
    ("system", system),
    ("human", "{question}"),
])

profiler_chain = profile_prompt | structured_llm_profiler
