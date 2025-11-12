import gradio as gr
from transformers import pipeline

# Türkçe sentiment modeli
sentiment = pipeline("sentiment-analysis", model="savasy/bert-base-turkish-sentiment-cased")

def analyze(text):
    res = sentiment(text)
    label = res[0]["label"]
    score = float(res[0]["score"])
    return label, score

# ✅ API modunu aktif et: api_name="predict"
app = gr.Interface(
    fn=analyze,
    inputs=gr.Textbox(lines=2, placeholder="Bir metin yaz..."),
    outputs=["text", "number"],
    title="AI Sentiment Service (Türkçe Destekli)",
    api_name="predict"  # ✅ Bu satır çok önemli!
)
app.queue() 
if __name__ == "__main__":
    app.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False  # HF Spaces'de share=False olmalı
    )