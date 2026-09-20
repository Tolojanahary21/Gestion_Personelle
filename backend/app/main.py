from fastapi import FastAPI

app = FastAPI(
    title="Gestion Personnel API",
    version="1.0.0"
)


@app.get("/")
def root():
    return {"message": "Gestion Personnel API fonctionne"}