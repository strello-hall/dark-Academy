// Get elements
const nameField = document.getElementById("memberName");
const profileLink = document.getElementById("profileLink");
const post1 = document.getElementById("post1");
const post2 = document.getElementById("post2");
const form = document.getElementById("memberForm");
const submitBtn = form.querySelector(".btn");

// Loading state
function setLoading(isLoading) {
    submitBtn.innerHTML = isLoading ? `⟳ جاري التسجيل...` : "إضافة العضو إلى الفرقة";
    submitBtn.disabled = isLoading;
}

// Create neon popup with auto-copy text
function showGraduationPopup(data) {
    const code = data.code || data.memberCode || data.verificationCode || "غير متوفر";

    const fullText = `●-•طلب تخرج عضو أكاديمية •-●

1. اسم العضو المتخرج: ${data.memberName}
2. كود العضو في الفريق الأساسي: ${code}
3. رابط حساب العضو: ${data.profileLink}
4. رابط المنشور الأول : ${ data.postLink1 || "Not available"}

5. رابط المنشور الثاني : ${ data.postLink2 || "Not available"}

6. سكرين يحتوي معلومات العضو من المنشور التعريفي:-
7.  سكرينات تعليقات العضو :-
`;

    const popupHTML = `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 10000; display: flex; align-items: center; justify-content: center; font-family: 'Cairo', sans-serif;">
            <div style="background: #0f0f0f; border: 3px solid #ff0033; border-radius: 20px; width: 95%; max-width: 480px; padding: 25px; box-shadow: 0 0 70px #ff0033;">
                
                <h2 style="color: #ff3366; text-align: center; margin-bottom: 20px; text-shadow: 0 0 20px #ff0033;">
                    طلب تخرج عضو أكاديمية
                </h2>

                <!-- Clickable Copy Area -->
                <div id="copyArea" style="background: #1a0005; border: 2px solid #440022; border-radius: 14px; padding: 18px; margin: 15px 0; line-height: 2.05; font-size: 1.02rem; color: #eee; cursor: pointer; user-select: text; transition: all 0.2s;">
                    ${fullText.replace(/\n/g, '<br>')}
                </div>

                <p style="text-align: center; color: #ff6666; font-size: 0.9rem; margin: 10px 0 20px;">
                    اضغط على النص أعلاه للنسخ التلقائي
                </p>

                <div style="display: flex; gap: 12px;">
                    <button id="closeBtn" style="flex: 1; padding: 15px; background: #222; color: #ddd; border: 2px solid #440022; border-radius: 12px; font-weight: bold; cursor: pointer;">
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    `;

    const popup = document.createElement("div");
    popup.innerHTML = popupHTML;
    document.body.appendChild(popup);

    const copyArea = document.getElementById("copyArea");

    // Auto copy when clicking the text area
    copyArea.addEventListener("click", () => {
        navigator.clipboard.writeText(fullText).then(() => {
            // Visual feedback
            const originalBorder = copyArea.style.border;
            const originalBg = copyArea.style.background;

            copyArea.style.border = "2px solid #00ff88";
            copyArea.style.background = "#002200";
            copyArea.style.color = "#00ff88";

            // Show "Copied!" temporarily
            const originalText = copyArea.innerHTML;
            copyArea.innerHTML = "✅ تم النسخ بنجاح!<br><br>" + fullText.replace(/\n/g, '<br>');

            setTimeout(() => {
                copyArea.innerHTML = originalText;
                copyArea.style.border = originalBorder;
                copyArea.style.background = originalBg;
                copyArea.style.color = "#eee";
            }, 1800);
        });
    });

    // Close button
    document.getElementById("closeBtn").addEventListener("click", () => {
        popup.remove();
        form.reset();
    });
}

// ====================== FORM SUBMIT ======================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const memberName = nameField.value.trim();
    const profile = profileLink.value.trim();
    const postLink2 = post2.value.trim();   // We only need post2 for the popup

    if (!memberName) return alert("❌ يرجى إدخال اسم العضو");
    if (!profile) return alert("❌ يرجى إدخال رابط البروفايل");
    if (!profile.startsWith("http")) return alert("❌ رابط البروفايل غير صحيح");

    setLoading(true);

    const payload = {
        memberName: memberName,
        profileLink: profile,
        postLink1: post1.value.trim() || null,
        postLink2: post2.value.trim() || null
    };
    console.log("done", payload)
    try {
        const response = await fetch("http://localhost:3000/", {   // ← Change this to your actual backend URL
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            showGraduationPopup({
                memberName: memberName,
                profileLink: profile,
                postLink2: postLink2,
                code: result.code || result.memberCode || result.verificationCode || result.id
            });
        } else {
            alert("❌ " + (result.message || "فشل في إضافة العضو"));
        }
    } catch (err) {
        alert("❌ خطأ في الاتصال بالسيرفر");
        console.error(err);
    } finally { 
        setLoading(false);
        
    }
});


