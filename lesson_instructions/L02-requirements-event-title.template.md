# Requirements — Rename event title (L-02)

**Student:** Elisheva Meirovitz  **Date:** 22/10/26  **Fork URL:** https://github.com/elisheva-meirovitz/event-photo-capstone.git

## 1. Original request (do not reinterpret)
> I entered the wrong event name. I want to be able to change the event name displayed in the client's gallery.

## 2. Current behavior — verified facts
| Claim | Evidence: file/function/line or HTTP result | Verified? |
| --- | --- | --- |
| Event title exists in data model | \src\domain\types.ts in export type EventRecord  in line 11: "title: string;" | Yes, verified in source |
| Current client gallery presents title | \src\http\app.ts is calling to "getClientGallery" in \src\services\event-service.ts. the function uses: "return...  title: event.title" and presents the title. | Yes, verified in source |
| No rename endpoint exists in inspected route file | src/http/app.ts defines only 5 routes: GET /health, GET /api/events, GET /api/events/:eventId/gallery, GET /client/events/:eventId/gallery , POST /api/events/:eventId/selections. There are no any "put", "patch" or "delete" route. | Yes, verified in source|

## 3. Actors / users / use cases / permissions
- Verified:
  1. Photographer is an actor:
     - identified by the "x-photographer-id" header in "src/http/app.ts".
     - findEventForPhotographer in "src/data/memory-store.ts" returns an event only if "photographerId" matches.
  2. Client is an actor:
     - Identified by the "x-client-id" header "src/http/app.ts".
     - findClientEvent in "src/data/memory-store.ts" returns an event only if "clientId" matches.
  3. use cases:
    - Photographer lists own events and views a gallery ("src/http/app.ts",in "/api/events" routes).
    - Client views own gallery and submits a selection in "src/http/app.ts", "/client/..." and "/selections" routes. 
  4. Permissions:
     - A photographer cannot get another photographer's event 
     - A client cannot get another client's gallery 
- Must clarify:
  - Who is allowed to change an event title: only the photographer who owns the event, or also the client?
  - The request comes from a client, so who actually performs the correction: does the client edit directly, or ask the photographer to do it?
  - Should anyone be notified when the title changes (client or photographer)?
  - Will the system keep the previous title (history), or overwrite it?

## 4. Goal, scope, out of scope
- Goal:
    the displayed event title in the client's gallery can be corrected after the event was created. 
- In scope (confirmed):
    only the original request
- Out of scope (confirmed):
    no screen design, no API choice, no code.
- Undecided:
    1. Who may rename
    2. Saving history
    3. Does the photogrfer need to confirm the change

## 5. Functional requirements
- FR-1 (provisional): if the title is valid, the gallery display the new title (instead of the old one).
- FR-2 (provisional, depends on decisio): only the actor may change the title.
- FR-3 (provisional, depends on decisio): if the new title isnt valid - the title stays unchanged.

## 6. Non-functional requirements / constraints
- NFR-1 (unresolved): The request regarding performance and response speed was not addresse. awaiting for further details.

## 7. Ten analysis lenses from the preparation assignment
| Term | Question relevant to this change | Answer known? / evidence |
| --- | --- | --- |
| functional requirements | What does the dydtem do whene the titlle is corrert? | the client gallery displayey the new title  |
| non-functional requirements | Any need for history, audit, speed or reliability around renaming?| No, not stated. Unresolved. |
| actors / users | 	Who performs the rename- photographer, client, or both? | Not known.(Actors that exist: photographer and client in "app.ts"). |
| use cases | Is it "client edits directly" or "client asks, photographer edits"? |not known. |
| constraints | What limits the solution today??| Answer known: in-memory store, demo identity headers, no validation (README). |
| assumptions | What are we assuming without any proofs?| the same title field feeds all views (verified in event-service.ts); assumed that no other place stores the title (not fully verified). |
| acceptance criteria |How will we know it works, that we finished? | The client gallery displays the new title after a valid change, invalid or unauthorized changes leave the old title unchanged. Provisional. |
| ambiguity | What is not understood about the requirement? |"I"- a client or the photographer? "the client's gallery"— only that view, or everywhere?|
| missing information | What do we not have?|title rules, history, notifications, unpublished-gallery behavior... |
| scope |What is included and excluded? |in: correcting the title. Out: design, API choice, code. |

## 8. Questions, assumptions, ambiguities
| Question or assumption | Why it matters | Evidence/status | Who decides? |
| --- | --- | --- | --- |
| Who can change the title: the photographer, the client, or both?|It decides the permissions| its open. Today clients can only view and select| Product owner|
| Does the client edit directly, or ask the photographer to fix it? | It changes the use case|its open| Product owner|
| What is a valid title (empty, too long, special characters)? | We need it for errors and tests| its open. No validation in code today| Product owner |
|should the old title be saved, or just replaced| it affects the data we keep. | its open. | Product owner |
| Should anyone get a notification after the change? | It may add work| its open| product owner |
|What if the gallery is not published? | The client gets 404, so they will not see the new title. | verified in"getClientGallery". Wanted behavior is open. | product owner |
| Assumption: we must add a PUT endpoint. | It is a design choice, not a fact. | Unverified, not adopted. | Design phase |

## 9. Acceptance criteria (provisional if decisions unresolved)
- Given existing event and an authorized user, when the title is changed to a valid new title, then hen the client gallery shows the new title (Provisional: who is authorized is still open.)
- Given an empty or invalid title, when they try to change the title, then then the old title stays (Provisional: validation rules are open.)

## 10. Error cases and tests
- Unknown event:
    the request changes nothing and returns an error.
- Unauthorized requester:
    someone who does not own the event cannot change its title.
- Empty title:
    the old title stays.
- Existing client gallery after change:
     shows the new title, and the photos and services stay the same.

## 11. AI checkpoints: understanding / questioning / spec review
Record one claim you verified in source and at least two AI suggestions with adopted/rejected/open status.

### AI question and spec review suggestions — reviewed critically
Claim verified in source: the client gallery shows the event title from the field "title" ("title: event.title" in "getClientGallery", "src/services/event-service.ts"). The route "GET /client/events/:eventId/gallery| in "src/http/app.ts" calls that function.|
| AI suggestion | Essential / later / irrelevant / unverified | Justification | Evidence |
| --- | --- | --- | --- |
| Add real authentication | Irrelevant. Rejected. | Out of scope for this change. | README limitation #1 |
| Add a PUT endpoint | Unverified. Rejected for now. | It is a design choice, not part of this lesson. | Lesson scope: no API choice |
| Keep a history of old titles | Later. Postponed. | Not requested, and it adds work. | No audit code in the repo|



## 12. Remaining decisions (do not silently invent answers)
-What is a valid title?
- should the old title be saved??
- Should anyone be notified?

## 13. Personal reflection
- One fact discovered through code review:
    A client sees the title only if the gallery is published. Otherwise "getClientGallery" returns nothing and the route answers 404.
- One AI suggestion you rejected or postponed, and why:
     I rejected adding a PUT endpoint because choosing an API is a design decision, and the lesson says not to choose one yet


--end--