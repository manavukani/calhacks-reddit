#!/usr/bin/env python3
"""
Test script for Letta AI moderation integration
Run this to verify the Letta agents are working correctly
"""

import os
import asyncio
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import our moderation functions
from main import get_letta_client, create_or_get_shared_memory, moderate_with_agent, aggregate_moderation_verdicts, extract_subreddit_from_url, get_agent_for_subreddit, LETTA_AGENTS

def test_regex_matching():
    """Test the regex pattern matching for agent selection"""
    print("🔍 Testing Regex Pattern Matching")
    print("-" * 30)
    
    test_subreddits = [
        "science", "technology", "programming", "machinelearning",
        "askreddit", "unpopularopinion", "changemyview",
        "worldnews", "politics", "geopolitics",
        "askhistorians", "history", "wwii",
        "unknown", "random", "test"
    ]
    
    for subreddit in test_subreddits:
        agent_subreddit, agent_id = get_agent_for_subreddit(subreddit)
        print(f"r/{subreddit:<15} → r/{agent_subreddit} agent")
    
    print()

async def test_letta_integration():
    """Test the Letta AI moderation system"""
    print("🧪 Testing Letta AI Moderation Integration")
    print("=" * 50)
    
    # Test regex matching first
    test_regex_matching()
    
    # Check environment variables
    letta_key = os.getenv("LETTA_API_KEY")
    if not letta_key:
        print("❌ LETTA_API_KEY not found in environment variables")
        return False
    
    print(f"✅ LETTA_API_KEY found: {letta_key[:10]}...")
    
    try:
        # Initialize Letta client
        print("\n🔗 Initializing Letta client...")
        client = get_letta_client()
        print("✅ Letta client initialized successfully")
        
        # Test shared memory creation
        print("\n🧠 Testing shared memory...")
        shared_memory = await create_or_get_shared_memory(client)
        print(f"✅ Shared memory ready: {shared_memory.id}")
        
        # Test content for moderation
        test_content = """
        Post Title: 'Scientists claim coffee is unhealthy again'
        Comment: 'This source is from a random health blog with no citation. 
        The research methodology is flawed and the conclusions are not supported by the data.'
        """
        
        print(f"\n📝 Testing moderation with sample content...")
        print(f"Content: {test_content[:100]}...")
        
        # Test subreddit detection and agent selection with multiple examples
        test_cases = [
            "https://www.reddit.com/r/science/comments/test123/",
            "https://www.reddit.com/r/technology/comments/test456/",
            "https://www.reddit.com/r/askreddit/comments/test789/",
            "https://www.reddit.com/r/worldnews/comments/test101/",
            "https://www.reddit.com/r/programming/comments/test202/",
            "https://www.reddit.com/r/unknown/comments/test303/"
        ]
        
        print(f"\n🔍 Testing subreddit detection and agent selection...")
        for test_url in test_cases:
            detected_subreddit = extract_subreddit_from_url(test_url)
            agent_subreddit, agent_id = get_agent_for_subreddit(detected_subreddit)
            print(f"   URL: {test_url}")
            print(f"   Detected: r/{detected_subreddit} → Agent: r/{agent_subreddit}")
        
        # Use the first test case for actual moderation
        test_url = test_cases[0]
        detected_subreddit = extract_subreddit_from_url(test_url)
        agent_subreddit, agent_id = get_agent_for_subreddit(detected_subreddit)
        
        # Test moderation with selected agent
        print(f"\n🤖 Testing agent: r/{agent_subreddit}")
        result = await moderate_with_agent(client, agent_id, test_content, agent_subreddit)
        moderation_results = [result]
        
        print(f"   Decision: {result['decision']}")
        print(f"   Confidence: {result['confidence']:.2f}")
        print(f"   Reason: {result['reason'][:100]}...")
        
        # Test aggregation with comment-level statistics
        print(f"\n📊 Testing decision aggregation...")
        final_decision = await aggregate_moderation_verdicts(moderation_results, 25)  # Simulate 25 comments
        
        print(f"Final Decision: {final_decision['final_decision']}")
        print(f"Confidence: {final_decision['confidence']:.2f}")
        print(f"Comment Flagging Statistics:")
        print(f"  Violations: {final_decision['verdict_breakdown']['VIOLATION']}")
        print(f"  Warnings: {final_decision['verdict_breakdown']['NEEDS_WARNING']}")
        print(f"  Clean: {final_decision['verdict_breakdown']['FINE']}")
        print(f"  Errors: {final_decision['verdict_breakdown']['ERROR']}")
        
        # Save results to shared memory
        print(f"\n💾 Saving results to shared memory...")
        client.blocks.update(
            block_id=shared_memory.id,
            value=json.dumps(moderation_results)
        )
        print("✅ Results saved to shared memory")
        
        print(f"\n🎉 All tests passed! Letta integration is working correctly.")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        return False

async def main():
    """Main test function"""
    success = await test_letta_integration()
    
    if success:
        print("\n✅ Letta AI moderation system is ready!")
        print("You can now use the moderation feature in the dashboard.")
    else:
        print("\n❌ Letta AI moderation system has issues.")
        print("Please check your LETTA_API_KEY and agent IDs.")

if __name__ == "__main__":
    asyncio.run(main())
