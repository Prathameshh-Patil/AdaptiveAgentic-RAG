from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from model import llm_model

llm = llm_model

# Using a local prompt template instead of pulling from hub to avoid connection/versioning issues
system = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
Context: {context}"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system),
    ("human", "{question}"),
])

generation_chain = prompt | llm | StrOutputParser()


"""
The generation chain is responsible for creating the actual response to the user's question. 
We leverage a proven RAG prompt from LangChain Hub that has been optimized for retrieval-augmented generation tasks. 
This prompt template knows how to effectively combine retrieved context with the user's question to generate coherent, informative responses.
The chain uses StrOutputParser ensures we get clean string output that can be easily processed by subsequent components.    
"""