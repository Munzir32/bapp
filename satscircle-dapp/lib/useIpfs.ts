const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT // For JWT auth (recommended)
const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
const pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET

// Custom Pinata IPFS client
class PinataIPFSClient {
  private jwt: string | undefined
  private apiKey: string | undefined
  private apiSecret: string | undefined

  constructor() {
    this.jwt = pinataJwt
    this.apiKey = pinataApiKey
    this.apiSecret = pinataApiSecret
  }

  async add(data: string) {
    if (!this.jwt && (!this.apiKey || !this.apiSecret)) {
      throw new Error('Pinata credentials not configured')
    }

    const formData = new FormData()
    const blob = new Blob([data], { type: 'application/json' })
    formData.append('file', blob, 'message.json')

    const headers: Record<string, string> = {}
    
    if (this.jwt) {
      headers['Authorization'] = `Bearer ${this.jwt}`
    } else if (this.apiKey && this.apiSecret) {
      headers['pinata_api_key'] = this.apiKey
      headers['pinata_secret_api_key'] = this.apiSecret
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Pinata API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    return { cid: result.IpfsHash }
  }

  async cat(cid: string) {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.status}`)
    }
    return response.text()
  }
}

export function useIpfs() {
  return new PinataIPFSClient()
} 