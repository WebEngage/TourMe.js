TourMe.js
===================

A JS API to trigger a chain of speech bubble style notifications on your website for better user-onboarding.

Sample usage:

To use, add the library to your page
&lt;script type="text/javascript" src="tourme.js"&gt;&lt;/script&gt;

Initialize TourMe as below:
--------------------

	new TourMe({
		baseCalloutNotificationId: "b8a5493b",
		tours: [
			{
				title: "Welcome to my cool new product",
				content: "Wanna see how it works? Try out our live demo ..",
				selector: "div[id=liveDemo] p:eq(1) > a.action-button"
			},
			{
				title: "... Or, check out this <b>video</b>",
				content: "Here's a cool explainer video on how the tool works",
				selector: "#play-video-button"
			}
		]
	});

