import express from "express"
import { URL } from "url"
import { Logger } from "./logger.js"

interface ClickData {
    timestamp: Date;
    referer: string;
}

interface UrlData {
    originalUrl: string;
    validUntil: Date;
    createdAt: Date;
    clicks: ClickData[];
}

const app = express()
app.use(express.json())
const logger = new Logger()

const urlDatabase = new Map<string, UrlData>()


app.post("/shorturls", (req, res) => {
    try {
        const { url, validity = 30, shortcode } = req.body
        if (urlDatabase.has(shortcode)){
            logger.error("Shortcode already exists in the database")
            return res.status(400).json({message:"Shortcode already exists"})
        }
        const finalShortcode = shortcode || Math.random().toString(36).substring(2, 8)
        
        const validUntil = new Date()
        validUntil.setMinutes(validUntil.getMinutes() + validity)

        urlDatabase.set(finalShortcode, {
            originalUrl: url,
            validUntil,
            createdAt: new Date(),
            clicks: []
        })

        logger.info(`Created short URL with code: ${finalShortcode}`)
        return res.status(201).json({
            shortLink: `http://localhost:3000/${finalShortcode}`,
            expiry: validUntil.toISOString()
        })
    } catch (e) {
        logger.error(`Unexpected error: ${e}`)
        return res.status(500).json({ error: "Internal server error" })
    }
})

app.get("/:shortcode", (req, res) => {
    const { shortcode } = req.params
    
    if (!urlDatabase.has(shortcode)) {
        logger.error(`Shortcode not found: ${shortcode}`)
        return res.status(404).json({ error: "Short URL not found" })
    }

    const urlData = urlDatabase.get(shortcode)!

    if (new Date() > urlData.validUntil) {
        logger.info(`Expired shortcode accessed: ${shortcode}`)
        urlDatabase.delete(shortcode)
        return res.status(410).json({ error: "Short URL has expired" })
    }

    const clickData: ClickData = {
        timestamp: new Date(),
        referer: req.get('referer') || 'direct',
    }
    urlData.clicks.push(clickData)

    logger.info(`Redirecting ${shortcode} to ${urlData.originalUrl}`)
    res.redirect(urlData.originalUrl)
})

app.get("/shorturls/:shortcode", (req, res) => {
    const { shortcode } = req.params

    if (!urlDatabase.has(shortcode)) {
        logger.error(`Statistics requested for non-existent shortcode: ${shortcode}`)
        return res.status(404).json({ error: "Short URL not found" })
    }

    const urlData = urlDatabase.get(shortcode)!

    const stats = {
        originalUrl: urlData.originalUrl,
        created: urlData.createdAt,
        expiry: urlData.validUntil,
        totalClicks: urlData.clicks.length,
        clicks: urlData.clicks.map(click => ({
            timestamp: click.timestamp,
            referer: click.referer,
        }))
    }

    logger.info(`Statistics retrieved for shortcode: ${shortcode}`)
    return res.status(200).json(stats)
})

const PORT = 3000
app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`)
})