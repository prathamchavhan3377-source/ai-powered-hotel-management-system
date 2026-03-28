import streamlit as st
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

def get_recommendation(budget, preferences):
    prompt = f"""
    You are a professional hotel concierge. Based on the following information, recommend the best room type (Single, Double, Suite, Deluxe):
    - Budget: {budget}
    - Preferences: {preferences}
    
    Provide a helpful and friendly response explaining why you chose that room type.
    """
    response = model.generate_content(prompt)
    return response.text

# Streamlit UI
st.set_page_config(page_title="HotelIQ AI Concierge", page_icon="🏨")

st.title("🏨 HotelIQ AI Concierge")
st.markdown("### Get personalized room recommendations using AI")

with st.sidebar:
    st.header("Settings")
    api_key = st.text_input("Enter Gemini API Key", type="password")
    if api_key:
        genai.configure(api_key=api_key)

st.divider()

col1, col2 = st.columns(2)

with col1:
    budget = st.selectbox("What is your budget range?", ["Economy", "Standard", "Premium", "Luxury"])
    
with col2:
    preferences = st.text_area("Any specific preferences?", placeholder="e.g., Sea view, quiet room, near elevator...")

if st.button("Get Recommendation", type="primary"):
    if not budget or not preferences:
        st.warning("Please fill in all fields.")
    else:
        with st.spinner("Consulting the AI Concierge..."):
            try:
                recommendation = get_recommendation(budget, preferences)
                st.success("Recommendation Ready!")
                st.markdown("---")
                st.markdown(recommendation)
            except Exception as e:
                st.error(f"An error occurred: {e}")

st.divider()
st.caption("Powered by HotelIQ AI Engine")
