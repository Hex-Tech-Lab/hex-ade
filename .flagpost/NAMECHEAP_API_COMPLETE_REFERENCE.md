# Namecheap API Complete Reference Guide

**Last Updated**: 2026-02-07  
**Status**: Ready for Implementation  
**Use Case**: DNS CNAME record management for Fly.io migration

---

## 1. API AUTHENTICATION

### Required Credentials
```
API_USER:      Your Namecheap account username
API_KEY:       API key from Namecheap dashboard (32 hex chars)
USERNAME:      Same as API_USER (used for permissions)
CLIENT_IP:     Your whitelisted IP address (required for API access)
```

### Get API Credentials
1. Log in to **Namecheap Dashboard**
2. Go to **Settings → API Access**
3. Enable API access
4. Copy your **API Key**
5. **Whitelist your IP** (find it in your router/network settings)

### API Endpoint
```
BASE_URL: https://api.namecheap.com/xml.response
METHOD:   GET (for read) or POST (for write, recommended for >10 records)
```

---

## 2. CRITICAL DOMAIN.DNS.SETHOSTS ENDPOINT

### Purpose
Sets ALL DNS host records for a domain. **WARNING**: Records not included in the request are DELETED.

### Workflow for Safe Updates
1. **GET existing records** using `domains.dns.getHosts`
2. **MERGE** new record with existing records
3. **POST all records** using `domains.dns.setHosts` (includes old + new)

### Request Parameters

```
ApiUser=<API_USER>
&ApiKey=<API_KEY>
&UserName=<USERNAME>
&ClientIp=<CLIENT_IP>
&Command=namecheap.domains.dns.setHosts
&SLD=<domain_sld>                          # e.g., "getmytestdrive"
&TLD=<domain_tld>                          # e.g., "com"
&HostName1=<hostname>                      # e.g., "ade-api" or "@" for root
&RecordType1=<type>                        # CNAME, A, MX, TXT, etc.
&Address1=<value>                          # e.g., "hex-ade-backend.fly.dev"
&TTL1=<seconds>                            # e.g., 1800
```

### Example: CNAME Record for Subdomain

```
POST https://api.namecheap.com/xml.response

ApiUser=myusername
&ApiKey=abcd1234efgh5678ijkl9012mnop3456
&UserName=myusername
&ClientIp=203.0.113.42
&Command=namecheap.domains.dns.setHosts
&SLD=getmytestdrive
&TLD=com
&HostName1=ade-api
&RecordType1=CNAME
&Address1=hex-ade-backend.fly.dev
&TTL1=1800
```

### Response Format (XML)
```xml
<?xml version="1.0"?>
<ApiResponse xmlns="http://api.namecheap.com/api/v2/xml">
  <Status>OK</Status>
  <CommandResponse Type="namecheap.domains.dns.setHosts">
    <DomainDNSSetHostsResult Domain="getmytestdrive.com" IsSuccess="true" />
  </CommandResponse>
</ApiResponse>
```

---

## 3. GETMYTESTDRIVE.COM CURRENT DNS SETUP

### Current Records (before Fly.io migration)
```
Type    | Host       | Value
--------|------------|------------------
A       | @          | 185.199.108.153
A       | @          | 185.199.109.153
A       | @          | 185.199.110.153
A       | @          | 185.199.111.153
NS      | ade-api    | <Render server IP>
```

### Target Records (after Fly.io migration)
```
Type    | Host       | Value
--------|------------|-----------------------------
A       | @          | 185.199.108.153  (keep)
A       | @          | 185.199.109.153  (keep)
A       | @          | 185.199.110.153  (keep)
A       | @          | 185.199.111.153  (keep)
CNAME   | ade-api    | hex-ade-backend.fly.dev  (NEW)
```

---

## 4. PYTHON IMPLEMENTATION (RECOMMENDED)

### Option A: Using namecheap-python Library

```bash
pip install namecheap-python
```

```python
from namecheap import Namecheap

# Initialize
nc = Namecheap(
    api_key="your_api_key",
    username="your_username",
    api_user="your_username",
    client_ip="your_whitelisted_ip"
)

# Get existing records
existing = nc.domains.dns.get_hosts("getmytestdrive.com")
print("Existing records:", existing)

# Update with CNAME record
records = nc.dns.builder() \
    .cname("ade-api", "hex-ade-backend.fly.dev") \
    .build()

# Set all records (merge with existing)
result = nc.domains.dns.set("getmytestdrive.com", records)
print("Update result:", result)
```

### Option B: Direct HTTP Request (Pure Python)

```python
import requests
from urllib.parse import urlencode

# Get existing records first
params = {
    'ApiUser': 'your_username',
    'ApiKey': 'your_api_key',
    'UserName': 'your_username',
    'ClientIp': 'your_whitelisted_ip',
    'Command': 'namecheap.domains.dns.getHosts',
    'SLD': 'getmytestdrive',
    'TLD': 'com'
}

response = requests.get('https://api.namecheap.com/xml.response', params=params)
print("Existing records:", response.text)

# Parse XML to extract existing records (use xml.etree.ElementTree)
# Then merge with new CNAME record

# POST new records
post_params = {
    'ApiUser': 'your_username',
    'ApiKey': 'your_api_key',
    'UserName': 'your_username',
    'ClientIp': 'your_whitelisted_ip',
    'Command': 'namecheap.domains.dns.setHosts',
    'SLD': 'getmytestdrive',
    'TLD': 'com',
    # Keep existing A records
    'HostName1': '@',
    'RecordType1': 'A',
    'Address1': '185.199.108.153',
    'TTL1': '1800',
    'HostName2': '@',
    'RecordType2': 'A',
    'Address2': '185.199.109.153',
    'TTL2': '1800',
    # Add CNAME for ade-api
    'HostName3': 'ade-api',
    'RecordType3': 'CNAME',
    'Address3': 'hex-ade-backend.fly.dev',
    'TTL3': '1800',
}

response = requests.post('https://api.namecheap.com/xml.response', data=post_params)
print("Update response:", response.text)
```

### Option C: Using namecheap-cli Tool

```bash
# Install
pip install namecheap-cli

# Set environment variables
export NAMECHEAP_API_KEY=your_api_key
export NAMECHEAP_USERNAME=your_username
export NAMECHEAP_CLIENT_IP=your_whitelisted_ip

# List current records
namecheap-cli dns list getmytestdrive.com

# Update CNAME record
namecheap-cli dns set getmytestdrive.com \
  --name ade-api \
  --type CNAME \
  --value hex-ade-backend.fly.dev \
  --ttl 1800
```

---

## 5. ERROR HANDLING

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `IP address is not whitelisted` | Client IP not added to API whitelist | Add IP in Namecheap Dashboard → Settings → API Access |
| `Command failed: Validation error` | Missing required parameters | Check SLD, TLD, HostName, RecordType, Address |
| `Authentication failure` | Wrong API key or username | Verify credentials in Namecheap dashboard |
| `Duplicate records created` | Records not merged before setHosts | Always GET first, MERGE, then POST |
| `Records deleted` | Didn't include existing records in setHosts | Always fetch existing before updating |

---

## 6. AUTOMATION SCRIPT TEMPLATE

```python
#!/usr/bin/env python3
"""
Namecheap DNS Update Script
Updates ade-api.getmytestdrive.com CNAME to point to Fly.io backend
"""

import requests
import xml.etree.ElementTree as ET
from typing import Dict, List
import os

class NamecheapDNSManager:
    def __init__(self, api_key: str, username: str, client_ip: str):
        self.api_key = api_key
        self.username = username
        self.client_ip = client_ip
        self.base_url = "https://api.namecheap.com/xml.response"
    
    def get_hosts(self, domain: str) -> List[Dict]:
        """Get existing DNS records"""
        sld, tld = domain.split('.')
        params = {
            'ApiUser': self.username,
            'ApiKey': self.api_key,
            'UserName': self.username,
            'ClientIp': self.client_ip,
            'Command': 'namecheap.domains.dns.getHosts',
            'SLD': sld,
            'TLD': tld
        }
        
        response = requests.get(self.base_url, params=params)
        root = ET.fromstring(response.text)
        
        records = []
        for host in root.findall('.//host'):
            records.append({
                'HostName': host.find('Name').text,
                'RecordType': host.find('Type').text,
                'Address': host.find('Address').text,
                'TTL': host.find('TTL').text,
            })
        return records
    
    def set_hosts(self, domain: str, records: List[Dict]) -> bool:
        """Set DNS records (replaces all existing)"""
        sld, tld = domain.split('.')
        
        params = {
            'ApiUser': self.username,
            'ApiKey': self.api_key,
            'UserName': self.username,
            'ClientIp': self.client_ip,
            'Command': 'namecheap.domains.dns.setHosts',
            'SLD': sld,
            'TLD': tld,
        }
        
        # Add records as numbered parameters
        for i, record in enumerate(records, 1):
            params[f'HostName{i}'] = record['HostName']
            params[f'RecordType{i}'] = record['RecordType']
            params[f'Address{i}'] = record['Address']
            params[f'TTL{i}'] = record['TTL']
        
        response = requests.post(self.base_url, data=params)
        root = ET.fromstring(response.text)
        
        # Check if successful
        status = root.find('Status').text
        return status == 'OK'

# Usage
if __name__ == '__main__':
    manager = NamecheapDNSManager(
        api_key=os.getenv('NAMECHEAP_API_KEY'),
        username=os.getenv('NAMECHEAP_USERNAME'),
        client_ip=os.getenv('NAMECHEAP_CLIENT_IP')
    )
    
    # Get existing records
    records = manager.get_hosts('getmytestdrive.com')
    print("Existing records:")
    for r in records:
        print(f"  {r['HostName']:20} {r['RecordType']:10} {r['Address']}")
    
    # Update CNAME
    for record in records:
        if record['HostName'] == 'ade-api' and record['RecordType'] == 'CNAME':
            record['Address'] = 'hex-ade-backend.fly.dev'
            break
    else:
        # Add new CNAME if doesn't exist
        records.append({
            'HostName': 'ade-api',
            'RecordType': 'CNAME',
            'Address': 'hex-ade-backend.fly.dev',
            'TTL': '1800'
        })
    
    # Set records
    if manager.set_hosts('getmytestdrive.com', records):
        print("✅ DNS records updated successfully")
    else:
        print("❌ Failed to update DNS records")
```

---

## 7. SUMMARY: WHAT YOU NEED

| Item | For hex-ade | Status |
|------|------------|--------|
| **API Key** | From Namecheap dashboard | Need to provide |
| **Username** | Namecheap account username | Need to provide |
| **Client IP** | Your whitelisted IP (or server IP) | Need to whitelist |
| **Domain** | getmytestdrive.com | Ready |
| **Subdomain** | ade-api | Ready |
| **Target** | hex-ade-backend.fly.dev | Ready (from GC-S2) |

---

## 8. NEXT STEPS

When GC-S2 completes Fly.io deployment and you have:
1. ✅ Fly.io backend URL (hex-ade-backend.fly.dev)
2. ✅ Namecheap API credentials
3. ✅ Whitelisted client IP

You can execute the automation script to update DNS in **< 1 minute**.

---

**Ready for DNS automation MCP skill development!**
