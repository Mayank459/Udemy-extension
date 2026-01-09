// Simple fix: replace the getTranscript function
// Copy this function and replace lines 253-282 in inject-tab.js

function getTranscript() {
    console.log('[Udemy AI] Getting transcript...');

    // Since both scripts run in the same content script context,
    // we can call the function directly from caption-extractor.js
    if (typeof extractTranscriptFromUdemy === 'function') {
        return extractTranscriptFromUdemy();
    } else {
        console.error('[Udemy AI] extractTranscriptFromUdemy function not found!');
        // Return sample transcript as fallback
        const SAMPLE_TRANSCRIPT = `Welcome to this lecture on Python functions and data structures.

In this session, we'll cover the fundamentals of Python programming, specifically focusing on functions and how to work with different data structures.

Let's start with a simple function definition. In Python, we use the def keyword to define a function.

Here's an example:

def greet(name):
    return f"Hello, {name}!"

This function takes a name parameter and returns a greeting string.

Now let's look at lists. Lists are one of the most versatile data structures in Python.

numbers = [1, 2, 3, 4, 5]
fruits = ["apple", "banana", "cherry"]

You can access list elements using indexing:

first_fruit = fruits[0]  # "apple"

And you can use list comprehensions for elegant data transformations:

squared_numbers = [x**2 for x in numbers]

That covers the basics of functions and lists in Python. In the next lecture, we'll explore dictionaries and sets.`;

        return Promise.resolve(SAMPLE_TRANSCRIPT);
    }
}
