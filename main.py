import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_huggingface import ChatHuggingFace, HuggingFacePipeline
from langchain.schema import HumanMessage, SystemMessage
import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv('.env.local')

# Initialize FastAPI
app = FastAPI()

# Etherscan API settings
ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY")
ETHERSCAN_API_URL = "https://api.etherscan.io/api"
DEFI_LLAMA_API_URL = "https://yields.llama.fi"

# Define the request model
class ChatRequest(BaseModel):
    message: str

# Utility function to retrieve data from Etherscan
def get_etherscan_data(module: str, action: str):
    try:
        params = {
            "module": module,
            "action": action,
            "apikey": ETHERSCAN_API_KEY
        }
        response = requests.get(ETHERSCAN_API_URL, params=params)
        response.raise_for_status()
        data = response.json()

        if data['status'] == '1':
            return data['result']
        else:
            raise HTTPException(status_code=400, detail="Error retrieving data from Etherscan")
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")
    
# Define the Etherscan Agent
class EtherscanAgent():
    def get_supply():
        ethsupply = get_etherscan_data("stats", "ethsupply")
        
        if ethsupply:
            return f"The total supply of Ethereum is {ethsupply}"

    def get_price_usd():
        ethprice = get_etherscan_data("stats", "ethprice").get("ethusd")

        if ethprice:
            return f"The current price of Ethereum is {ethprice} $"
        
    def get_price_btc():
        ethprice = get_etherscan_data("stats", "ethprice").get("ethbtc")

        if ethprice:
            return f"The current price of Ethereum is {ethprice} btc"

# Define the DeFiLlama Agent
class DefillamaAgent():
    # Function to get all pools
    def get_all_pools() -> str:
        try:
            pools_data = get_defillama_data("pools")
            
            if pools_data['status'] == 'success':
                # Limit to the first 5 pools
                first_five_pools = pools_data['data'][:5]
                
                # Format the pools information
                pools_info = "First 5 Available Pools:\n"
                for pool in first_five_pools:
                    pools_info += (
                        f"- Chain: {pool['chain']}, "
                        f"Project: {pool['project']}, "
                        f"Symbol: {pool['symbol']}, "
                        f"TVL: ${pool['tvlUsd']:,.2f}, "
                        f"APY: {pool['apy']:.2f}%, "
                        f"Pool ID: {pool['pool']}\n"
                    )

                return pools_info.strip()
            else:
                raise HTTPException(status_code=400, detail="Error retrieving data from DeFiLlama")
        except requests.RequestException as e:
            raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")

    # Function to get information for a specific pool by ID
    def get_pool_info(pool_id: str) -> str:
        try:
            # Retrieve data for the specific pool by its ID
            pool_data = get_defillama_data(f"chart/{pool_id}")

            # Print the pool data in a text file for debugging
            with open("pool_data_id_d4b3c522-6127-4b89-bedf-83641cdcd2eb.txt", "w") as f:
                f.write(json.dumps(pool_data, indent=4))

            # Check if the response status indicates success
            if pool_data['status'] == 'success':
                # Format pool information
                pool_info = "Historical Data:\n"
                for entry in pool_data['data']:
                    pool_info += (
                        f"- Timestamp: {entry['timestamp']}\n"
                        f"  TVL (USD): ${entry['tvlUsd']:,.2f}\n"
                        f"  APY: {entry['apy']:.2f}%\n"
                        f"  APY (Base): {entry['apyBase']:.2f}%\n"
                        f"  APY (Reward): {entry['apyReward'] if entry['apyReward'] is not None else 'N/A'}%\n"
                        f"  IL (7d): {entry['il7d'] if entry['il7d'] is not None else 'N/A'}\n"
                        f"  APY (Base 7d): {entry['apyBase7d'] if entry['apyBase7d'] is not None else 'N/A'}%\n"
                    )
                return pool_info.strip()
            else:
                raise HTTPException(status_code=400, detail="Error retrieving pool data")

        except requests.RequestException as e:
            raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")


# Utility function to retrieve data from DeFiLlama
def get_defillama_data(endpoint: str):
    try:
        url = f"{DEFI_LLAMA_API_URL}/{endpoint}"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Request to DeFiLlama failed: {str(e)}")

# Initialize the ChatHuggingFace model
llm = HuggingFacePipeline.from_model_id(
    model_id="HuggingFaceH4/zephyr-7b-beta",
    task="text-generation",
    pipeline_kwargs=dict(
        max_new_tokens=512,
        do_sample=False,
        repetition_penalty=1.03,
    ),
)

chat_model = ChatHuggingFace(llm = llm)

# Router for handling commands
def command_router(command: str):
    if command.lower() == "help":
        return """I can assist you with Ethereum blockchain and DeFi data. Here are some commands you can try:
        
        **Etherscan Commands**:
        1. `Get eth supply` - Retrieve the total supply of Ethereum.
        2. `Get eth price` - Fetch the current Ethereum price.

        **DeFiLlama Commands**:
        1. `Get defi pools` - Get information about the first 5 DeFi pools.
        2. `Get defi pools id <pool_id>` - Get detailed information about a specific DeFi pool by its ID.

        For unknown commands, I will do my best to assist using my built-in language model.
        """""
    elif command.lower() == "get eth supply":
        return EtherscanAgent.get_supply()
    elif command.lower() == "get eth price":
        return f"Please specify the currency you want the price in. You can use {command} usd or {command} btc."
    elif command.lower() == "get eth price usd":
        return EtherscanAgent.get_price_usd()
    elif command.lower() == "get eth price btc":
        return EtherscanAgent.get_price_btc()
    elif command.lower() == "get defi pools":
        return DefillamaAgent.get_all_pools()
    elif command.lower().startswith("get defi pools id"):
        return DefillamaAgent.get_pool_info(command.split(" ")[-1])
    else:
        # Use the LLM to handle unknown commands
        # Define a prompt for the LLM
        messages = [
            SystemMessage(content="You are a helpful assistant that can interact with Ethereum blockchain data and DeFiLlama API. "),
            HumanMessage(
                content=f"The command received is: {command}. What should I reply?"
            ),
        ]
        response = chat_model.invoke(messages)
        return response.content

# POST endpoint for /api/chat
@app.post("/api/chat")
async def chat(request: ChatRequest):
    command = request.message.strip()
    response_message = command_router(command)
    
    return {"reply": response_message}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
