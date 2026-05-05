from typing import Any, Dict
from graph.state import GraphState
from graph.chains.profiler import profiler_chain
from database import log_query, update_interest
from model import embed_model

def profile_updater(state: GraphState) -> Dict[str, Any]:
    print("---UPDATING USER PROFILE---")
    question = state["question"]
    
    # 1. Log the raw query to Neon
    try:
        log_query(question)
    except Exception as e:
        print(f"Error logging query: {e}")
    
    # 2. Extract interests using LLM
    try:
        profile = profiler_chain.invoke({"question": question})
        
        for item in profile.interests:
            print(f"---EXTRACTED INTEREST: {item.interest} ({item.category})---")
            
            # 3. Get embedding for the interest name
            embedding = embed_model.embed_query(item.interest)
            
            # 4. Save to Neon
            update_interest(
                interest_name=item.interest,
                category=item.category,
                confidence=item.confidence,
                embedding=embedding
            )
    except Exception as e:
        print(f"Error updating interests: {e}")
        
    return {"question": question}
