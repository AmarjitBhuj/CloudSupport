const API_URL =
    "https://fozd4svxf1.execute-api.us-east-1.amazonaws.com";


// ========================================
// SUBMIT SUPPORT REQUEST
// ========================================

const supportForm = document.getElementById("supportForm");
const submitButton = document.getElementById("submitButton");
const submitMessage = document.getElementById("submitMessage");

supportForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const category = document.getElementById("category").value;
    const priority = document.getElementById("priority").value;
    const description =
        document.getElementById("description").value.trim();


    // Frontend validation
    if (name.length < 2 || name.length > 50) {
        showMessage(
            submitMessage,
            "Name must be between 2 and 50 characters.",
            "error"
        );
        return;
    }

    if (description.length < 10 || description.length > 1000) {
        showMessage(
            submitMessage,
            "Description must be between 10 and 1000 characters.",
            "error"
        );
        return;
    }


    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    hideMessage(submitMessage);


    try {

        const response = await fetch(`${API_URL}/requests`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email,
                category,
                priority,
                description
            })
        });


        const data = await response.json();


        if (!response.ok) {
            throw new Error(
                data.message || "Unable to submit request."
            );
        }


        showMessage(
            submitMessage,
            `Request created successfully! Your Request ID is ${data.requestId}`,
            "success"
        );


        supportForm.reset();
        updateCharacterCount();


        // Put the request ID into the tracking box
        document.getElementById("requestId").value =
            data.requestId;


        // Scroll to tracking section
        document.getElementById("track").scrollIntoView({
            behavior: "smooth"
        });

    }

    catch (error) {

        console.error(error);

        showMessage(
            submitMessage,
            error.message || "Unable to connect to the server.",
            "error"
        );

    }

    finally {

        submitButton.disabled = false;
        submitButton.textContent = "Submit Request →";

    }

});


// ========================================
// TRACK SUPPORT REQUEST
// ========================================

const trackButton = document.getElementById("trackButton");
const trackMessage = document.getElementById("trackMessage");
const requestResult = document.getElementById("requestResult");


trackButton.addEventListener("click", async () => {

    const requestId =
        document.getElementById("requestId").value.trim();


    if (!requestId) {

        showMessage(
            trackMessage,
            "Please enter a request ID.",
            "error"
        );

        return;
    }


    trackButton.disabled = true;
    trackButton.textContent = "Searching...";

    hideMessage(trackMessage);
    requestResult.classList.add("hidden");


    try {

        const response = await fetch(
            `${API_URL}/requests/${encodeURIComponent(requestId)}`,
            {
                method: "GET"
            }
        );


        const data = await response.json();


        if (!response.ok) {
            throw new Error(
                data.message || "Request not found."
            );
        }


        displayRequest(data);

    }

    catch (error) {

        console.error(error);

        showMessage(
            trackMessage,
            error.message || "Unable to retrieve request.",
            "error"
        );

    }

    finally {

        trackButton.disabled = false;
        trackButton.textContent = "Track Request";

    }

});


// ========================================
// DISPLAY REQUEST
// ========================================

function displayRequest(data) {

    requestResult.innerHTML = `
        <div class="result-header">
            <h3>Support Request</h3>
            <div class="result-id">${escapeHtml(data.requestId)}</div>
        </div>

        <div class="result-body">

            <div class="result-row">
                <div class="result-label">Customer</div>
                <div>${escapeHtml(data.name)}</div>
            </div>

            <div class="result-row">
                <div class="result-label">Email</div>
                <div>${escapeHtml(data.email)}</div>
            </div>

            <div class="result-row">
                <div class="result-label">Category</div>
                <div>${escapeHtml(data.category)}</div>
            </div>

            <div class="result-row">
                <div class="result-label">Priority</div>
                <div>${escapeHtml(data.priority)}</div>
            </div>

            <div class="result-row">
                <div class="result-label">Status</div>
                <div>
                    <span class="status">
                        ${escapeHtml(data.status)}
                    </span>
                </div>
            </div>

            <div class="result-row">
                <div class="result-label">Description</div>
                <div>${escapeHtml(data.description)}</div>
            </div>

            <div class="result-row">
                <div class="result-label">Created</div>
                <div>${formatDate(data.createdAt)}</div>
            </div>

        </div>
    `;

    requestResult.classList.remove("hidden");

    requestResult.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


// ========================================
// CHARACTER COUNTER
// ========================================

const descriptionInput =
    document.getElementById("description");

const characterCount =
    document.getElementById("characterCount");


descriptionInput.addEventListener(
    "input",
    updateCharacterCount
);


function updateCharacterCount() {

    characterCount.textContent =
        descriptionInput.value.length;

}


// ========================================
// MESSAGE HELPERS
// ========================================

function showMessage(element, message, type) {

    element.textContent = message;

    element.className = `message ${type}`;

}


function hideMessage(element) {

    element.textContent = "";
    element.className = "message";

}


// ========================================
// SECURITY / DISPLAY HELPERS
// ========================================

function escapeHtml(value) {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;

}


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(dateString);

    return date.toLocaleString();

}