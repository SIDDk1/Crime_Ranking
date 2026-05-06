import requests
try:
    res = requests.post(
        "https://crime-ranking.onrender.com/api/auth/login",
        json={"email": "test@test.com", "password": "password"}
    )
    print("Status:", res.status_code)
    print("Headers:", res.headers)
    print("Body:", res.text)
except Exception as e:
    print("Error:", e)
