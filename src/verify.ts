import { initializeTools, executeToolWrapper } from "./tools/index.js";

async function verify() {
    console.log("=== Verification Started ===");

    // Initialize tools from Rails
    await initializeTools();

    // Helper to execute tools
    const execute = async (toolName: string, args: any) => {
        return await executeToolWrapper(toolName, args);
    };

    // 1. List Tickets (renamed from list_tasks)
    console.log("\n[1] Listing Tickets...");
    const listResult = await execute("list_tickets", { status: "todo" });
    if ((listResult as any).isError) {
        console.error("List Tickets Failed:", listResult.content[0].text);
        return;
    }

    let tickets;
    try {
        const parsed = JSON.parse(listResult.content[0].text);
        tickets = parsed.data || parsed; // Handle JSON:API or raw array
    } catch (e) {
        console.error("Failed to parse list response:", listResult.content[0].text.substring(0, 200));
        return;
    }

    console.log(`Found ${tickets?.length || 0} tickets.`);

    if (!tickets || tickets.length === 0) {
        console.error("No tickets found to start work on. Seed data missing?");
        return;
    }

    const ticketId = tickets[0].id;
    console.log(`Target Ticket ID: ${ticketId}`);

    // 2. Start Work (Transition ticket)
    console.log("\n[2] Starting Work...");
    const startResult = await execute("transition_ticket", { ticket_id: parseInt(ticketId), event: "start_work" });
    if ((startResult as any).isError) {
        console.error("Start Work Failed:", startResult.content[0].text);
        return;
    }
    console.log("Start Work Successful:", startResult.content[0].text.substring(0, 100) + "...");

    // 3. Submit Review (Transition ticket)
    console.log("\n[3] Submitting for Review...");
    const submitResult = await execute("transition_ticket", { ticket_id: parseInt(ticketId), event: "submit_review" });
    if ((submitResult as any).isError) {
        console.error("Submit Review Failed:", submitResult.content[0].text);
    } else {
        console.log("Submit Review Result:", submitResult.content[0].text.substring(0, 100) + "...");
    }

    // 4. Search Memory
    console.log("\n[4] Searching Memory...");
    const searchResult = await execute("search_memory", { query: "Verified" });
    console.log("Search Result:", searchResult.content[0].text);

    console.log("\n=== Verification Completed ===");
}

verify().catch(error => {
    console.error("Verification Script Error:", error);
    process.exit(1);
});
