boolean incorrectPasscodeAttempts(String passcode, String[] attempts) {

    int cnt=0, cor=0;
    boolean flag=true;
    System.out.println(attempts.length);
    if(attempts.length==0) {
      flag= false;
    }
    for(int i=0; i<attempts.length; i++ ) 
    {
        if(attempts[i]!=passcode) 
        {
            cnt++;
            if(cnt>=10)
            {
             flag= true;
            }
          
        }
        if(attempts[i]==passcode) 
        {
            cor++;
            if(cor==attempts.length)
            {
                 flag=false;
            }
          
            System.out.println(cor);
         }
         
    }
     return flag;
}

1.
Input(s)
passcode: "1111"
attempts: ["1111", 
 "9999", 
 "9999", 
 "9999", 
 "9999", 
 "9999", 
 "9999", 
 "9999", 
 "9999", 
 "9999", 
 "9999", 
 "1111"]
 
Output
true
 
Expected Output
true

2.
Input(s)
passcode: "1111"
attempts: []
 
Output
false
 
Expected Output
false
 
Console Output
0


3.
Input(s)
passcode: "1111"
attempts: ["1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111"]
 
Output
false
 
Expected Output
false

4.
Input(s)
passcode: "1112"
attempts: ["1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111"]
 
Output
true
 
Expected Output
true

5.
passcode: "1112"
attempts: ["1112", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111", 
 "1111"]
 
Output
true
 
Expected Output
true

6.
Input(s)
passcode: "7112"
attempts: ["7112", 
 "7211", 
 "7311", 
 "7111", 
 "7411", 
 "7112", 
 "7511", 
 "7911", 
 "7611", 
 "7811", 
 "7611", 
 "7811", 
 "7611", 
 "7811", 
 "7711"]
 
Output
true
 
Expected Output
false