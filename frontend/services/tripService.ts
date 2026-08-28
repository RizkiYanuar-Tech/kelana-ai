const API_URL = process.env.API_URL;

export async function getTrips(){
    const res = await fetch(`${API_URL}/trips`)
    return res.json();
}

export async function getTrip(id: number){
    const res = await fetch(`${API_URL}/trips/${id}`)
    if (!res.ok){
        throw new Error(`Failed fetching trip ${id}: ${res.status} ${res.statusText}`)
    }
    return res.json();
}

export async function generateTrips(data: any){
    const res = await fetch(`${API_URL}/trips`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });
    if (!res.ok){
        throw new Error(`Failed generate trips ${res.status} ${res.statusText}`)
    }
    return res.json();
}