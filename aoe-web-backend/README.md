# AOE Web Backend service

Web-backend Service for the Library of Open Educational Resources

## OAI-PMH Metadata Provider

Web-backend serves an [OAI-PMH](https://www.openarchives.org/OAI/2.0/openarchivesprotocol.htm) (Open Archives Initiative Protocol for Metadata Harvesting) interface so external library catalogs, repositories, and metadata aggregators can harvest AOE material metadata as standardized XML (DublinCore + LRMI-FI).

- `GET /meta/oaipmh` — v1; identifiers `oai:<domain>:{id}`; includes deleted records
- `GET /meta/v2/oaipmh` — v2; URN-based identifiers `oai:<domain>:{id}-{date}`; all versions; omits deleted records

Supported verbs: `Identify`, `ListRecords`, `ListIdentifiers`, `GetRecords`. List responses are paginated 20 records per page via resumption tokens (plain page-index integers) — follow the `<resumptionToken>` value until it is empty.
