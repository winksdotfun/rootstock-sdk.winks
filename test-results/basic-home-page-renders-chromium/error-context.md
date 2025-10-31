# Page snapshot

```yaml
- generic [active]:
  - dialog "Unhandled Runtime Error" [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - navigation [ref=e7]:
            - button "previous" [disabled] [ref=e8]:
              - img "previous" [ref=e9]
            - button "next" [ref=e11] [cursor=pointer]:
              - img "next" [ref=e12]
            - generic [ref=e14]: 1 of 3 unhandled errors
          - button "Close" [ref=e15] [cursor=pointer]:
            - img [ref=e17]
        - heading "Unhandled Runtime Error" [level=1] [ref=e20]
        - paragraph [ref=e21]: "TypeError: Cannot read properties of null (reading 'useState')"
      - generic [ref=e22]:
        - heading "Source" [level=2] [ref=e23]
        - generic [ref=e24]:
          - link "../dist/components/Winks.js (6:44) @ Winks" [ref=e26] [cursor=pointer]:
            - generic [ref=e27]: ../dist/components/Winks.js (6:44) @ Winks
            - img [ref=e28]
          - generic [ref=e32]: "4 | const WINKS_API_URL = 'https://ser-gray.vercel.app'; 5 | const Winks = ({ apikey, children, fallback = {} }) => { > 6 | const [metaData, setMetaData] = useState(fallback); | ^ 7 | const [loading, setLoading] = useState(true); 8 | const [error, setError] = useState(null); 9 | useEffect(() => {"
        - button "Show collapsed frames" [ref=e33] [cursor=pointer]
  - generic:
    - alertdialog
```